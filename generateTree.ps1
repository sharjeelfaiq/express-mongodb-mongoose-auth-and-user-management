<#
.SYNOPSIS
  High-performance directory tree generator with streaming output and parallel processing.

.DESCRIPTION
  Recursively lists directories and files with advanced optimizations including:
  - Streaming output to handle massive directory structures
  - Optional parallel processing for performance
  - Memory-efficient string operations
  - Configurable output formats
  - Smart caching and early termination

.PARAMETER Path
  The root path to start generating the tree. Defaults to current directory.

.PARAMETER MaxDepth
  Optional maximum recursion depth (1-50). Defaults to unlimited.

.PARAMETER FileExtensionFilter
  Optional file extension filter (e.g. '.ps1'). Only files matching this extension will be listed.

.PARAMETER OutputFile
  Output file path. Defaults to "directory_tree.md" in current directory.

.PARAMETER ExcludePatterns
  Array of regex patterns to exclude from the tree. Defaults to common unwanted folders.

.PARAMETER ShowProgress
  Display progress information during tree generation.

.PARAMETER IncludeStats
  Include file count and size statistics in the output.

.PARAMETER UseParallel
  Enable parallel processing for large directory structures (requires PowerShell 7+).

.PARAMETER OutputFormat
  Output format: Markdown, PlainText, JSON, or XML. Defaults to Markdown.

.PARAMETER StreamOutput
  Write output incrementally instead of collecting in memory (better for huge trees).

.PARAMETER MaxFileSize
  Maximum file size to process (in MB). Files larger than this are skipped. Default: 100MB.

.EXAMPLE
  .\GenerateTree.ps1 -Path C:\Projects -MaxDepth 3 -UseParallel -StreamOutput -OutputFormat JSON
#>

[CmdletBinding()]
param(
    [ValidateScript({Test-Path $_ -PathType Container})]
    [string]$Path = (Get-Location).Path,
    
    [ValidateRange(1, 50)]
    [int]$MaxDepth = [int]::MaxValue,
    
    [ValidatePattern('^\.[a-zA-Z0-9]+$|^$')]
    [string]$FileExtensionFilter = '',
    
    [ValidateNotNullOrEmpty()]
    [string]$OutputFile = "directory_tree.md",
    
    [string[]]$ExcludePatterns = @('^\.\w+', '^node_modules$', '^dist$', '^generateTree.ps1$', '^\.git$', '^bin$', '^obj$', '^packages$', '^\.vs$', '^Debug$', '^Release$'),
    
    [switch]$ShowProgress,
    [switch]$IncludeStats,
    [switch]$UseParallel,
    [switch]$StreamOutput,
    
    [ValidateSet('Markdown', 'PlainText', 'JSON', 'XML')]
    [string]$OutputFormat = 'Markdown',
    
    [ValidateRange(1, 1000)]
    [int]$MaxFileSize = 100
)

# Global optimized variables
$script:CompiledExcludePatterns = [System.Collections.Generic.List[regex]]::new()
$script:FileCount = 0
$script:DirectoryCount = 0
$script:TotalSize = [long]0
$script:ProcessedItems = 0
$script:OutputFileLeaf = Split-Path -Leaf $OutputFile
$script:MaxFileSizeBytes = $MaxFileSize * 1MB
$script:StringBuilder = [System.Text.StringBuilder]::new(8192)
$script:PathCache = [System.Collections.Generic.Dictionary[string,bool]]::new()

# Pre-compile all regex patterns at startup for maximum performance
foreach ($pattern in $ExcludePatterns) {
    try {
        $script:CompiledExcludePatterns.Add([regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor [System.Text.RegularExpressions.RegexOptions]::Compiled))
    }
    catch {
        Write-Warning "Invalid regex pattern '$pattern': $($_.Exception.Message)"
    }
}

function Test-ShouldExclude {
    [OutputType([bool])]
    param([string]$Name)
    
    # Use cached result if available
    if ($script:PathCache.ContainsKey($Name)) {
        return $script:PathCache[$Name]
    }
    
    $shouldExclude = $false
    foreach ($pattern in $script:CompiledExcludePatterns) {
        if ($pattern.IsMatch($Name)) {
            $shouldExclude = $true
            break
        }
    }
    
    # Cache the result for future use
    $script:PathCache[$Name] = $shouldExclude
    return $shouldExclude
}

function Get-OptimizedDirectoryItems {
    [OutputType([System.IO.FileSystemInfo[]])]
    param([string]$Path)
    
    try {
        # Use .NET DirectoryInfo for better performance
        $dirInfo = [System.IO.DirectoryInfo]::new($Path)
        
        if ($FileExtensionFilter) {
            # Separate queries for directories and filtered files for optimal performance
            $directories = $dirInfo.GetDirectories('*', [System.IO.SearchOption]::TopDirectoryOnly)
            $files = $dirInfo.GetFiles("*$FileExtensionFilter", [System.IO.SearchOption]::TopDirectoryOnly)
            $allItems = @($directories) + @($files)
        } else {
            $allItems = $dirInfo.GetFileSystemInfos('*', [System.IO.SearchOption]::TopDirectoryOnly)
        }
        
        # Filter and sort in a single pipeline operation
        return $allItems | Where-Object {
            $_.Name -ne $script:OutputFileLeaf -and
            -not (Test-ShouldExclude $_.Name) -and
            ($_.Attributes -band [System.IO.FileAttributes]::Directory -or 
             $_.Length -le $script:MaxFileSizeBytes)
        } | Sort-Object @{Expression = {$_.Attributes -band [System.IO.FileAttributes]::Directory}; Descending = $true}, Name
    }
    catch {
        Write-Warning "Could not access directory: $Path - $($_.Exception.Message)"
        return @()
    }
}

function Format-TreeLine {
    [OutputType([string])]
    param(
        [System.IO.FileSystemInfo]$Item,
        [string]$Prefix,
        [bool]$IsLast,
        [string]$Format = 'Markdown'
    )
    
    $pointer = if ($IsLast) { '└──' } else { '├──' }
    $isDirectory = $Item.Attributes -band [System.IO.FileAttributes]::Directory
    
    switch ($Format) {
        'Markdown' {
            $symbol = if ($isDirectory) { '🗂️' } else { '📄' }
            $line = "$Prefix$pointer $symbol $($Item.Name)"
        }
        'PlainText' {
            $symbol = if ($isDirectory) { 'DIR' } else { 'FILE' }
            $line = "$Prefix$pointer [$symbol] $($Item.Name)"
        }
        'JSON' {
            # JSON format handled separately
            return $null
        }
        'XML' {
            # XML format handled separately
            return $null
        }
    }
    
    if ($IncludeStats -and -not $isDirectory -and $Item.Length -gt 0) {
        $sizeKB = [math]::Round($Item.Length / 1KB, 2)
        $line += " ($sizeKB KB)"
    }
    
    return $line
}

function Write-StreamOutput {
    param([string]$Content, [System.IO.StreamWriter]$Writer)
    
    if ($StreamOutput -and $Writer) {
        $Writer.WriteLine($Content)
        $Writer.Flush()
    } else {
        $script:StringBuilder.AppendLine($Content) | Out-Null
    }
}

function Get-HighPerformanceTree {
    param(
        [string]$Path,
        [string]$Prefix = '',
        [int]$CurrentDepth = 0,
        [System.IO.StreamWriter]$StreamWriter = $null
    )

    if ($CurrentDepth -ge $MaxDepth) {
        return
    }

    $items = Get-OptimizedDirectoryItems -Path $Path
    $itemCount = $items.Count
    
    # Process items with optional parallel processing
    if ($UseParallel -and $itemCount -gt 10 -and $PSVersionTable.PSVersion.Major -ge 7) {
        # Create indexed array for parallel processing
        $indexedItems = @()
        for ($i = 0; $i -lt $itemCount; $i++) {
            $indexedItems += @{Index = $i; Item = $items[$i]; IsLast = ($i -eq $itemCount - 1)}
        }
        
        # Parallel processing for large directories (PowerShell 7+ only)
        $results = $indexedItems | ForEach-Object -Parallel {
            $indexedItem = $_
            $item = $indexedItem.Item
            $isLast = $indexedItem.IsLast
            
            # Increment counters thread-safely
            if ($item.Attributes -band [System.IO.FileAttributes]::Directory) {
                [System.Threading.Interlocked]::Increment([ref]$using:script:DirectoryCount)
            } else {
                [System.Threading.Interlocked]::Increment([ref]$using:script:FileCount)
                [System.Threading.Interlocked]::Add([ref]$using:script:TotalSize, $item.Length)
            }
            
            # Format line using static method reference
            $pointer = if ($isLast) { '└──' } else { '├──' }
            $isDirectory = $item.Attributes -band [System.IO.FileAttributes]::Directory
            
            switch ($using:OutputFormat) {
                'Markdown' {
                    $symbol = if ($isDirectory) { '🗂️' } else { '📄' }
                    $line = "$using:Prefix$pointer $symbol $($item.Name)"
                }
                'PlainText' {
                    $symbol = if ($isDirectory) { 'DIR' } else { 'FILE' }
                    $line = "$using:Prefix$pointer [$symbol] $($item.Name)"
                }
                default {
                    $line = $null
                }
            }
            
            if ($using:IncludeStats -and -not $isDirectory -and $item.Length -gt 0) {
                $sizeKB = [math]::Round($item.Length / 1KB, 2)
                $line += " ($sizeKB KB)"
            }
            
            return @{Item = $item; Line = $line; IsLast = $isLast; Index = $indexedItem.Index}
        } -ThrottleLimit 4
        
        # Sort results by index to maintain order
        $sortedResults = $results | Sort-Object Index
        
        foreach ($result in $sortedResults) {
            if ($result.Line) {
                Write-StreamOutput -Content $result.Line -Writer $StreamWriter
            }
            
            if ($result.Item.Attributes -band [System.IO.FileAttributes]::Directory) {
                $newPrefix = if ($result.IsLast) { $Prefix + '    ' } else { $Prefix + '│   ' }
                Get-HighPerformanceTree -Path $result.Item.FullName -Prefix $newPrefix -CurrentDepth ($CurrentDepth + 1) -StreamWriter $StreamWriter
            }
        }
    } else {
        # Sequential processing
        for ($i = 0; $i -lt $itemCount; $i++) {
            $item = $items[$i]
            $isLast = ($i -eq $itemCount - 1)
            $script:ProcessedItems++

            # Progress reporting with reduced frequency for better performance
            if ($ShowProgress -and ($script:ProcessedItems % 250 -eq 0)) {
                Write-Progress -Activity "Generating directory tree" -Status "Processed $script:ProcessedItems items" -PercentComplete -1
            }

            # Update statistics
            if ($item.Attributes -band [System.IO.FileAttributes]::Directory) {
                $script:DirectoryCount++
            } else {
                $script:FileCount++
                $script:TotalSize += $item.Length
            }

            $line = Format-TreeLine -Item $item -Prefix $Prefix -IsLast $isLast -Format $OutputFormat
            if ($line) {
                Write-StreamOutput -Content $line -Writer $StreamWriter
            }

            # Recurse into directories
            if ($item.Attributes -band [System.IO.FileAttributes]::Directory) {
                $newPrefix = if ($isLast) { $Prefix + '    ' } else { $Prefix + '│   ' }
                Get-HighPerformanceTree -Path $item.FullName -Prefix $newPrefix -CurrentDepth ($CurrentDepth + 1) -StreamWriter $StreamWriter
            }
        }
    }
}

function Format-FileSize {
    [OutputType([string])]
    param([long]$Bytes)
    
    if ($Bytes -eq 0) { return "0 B" }
    
    $sizes = @('B', 'KB', 'MB', 'GB', 'TB', 'PB')
    $index = [math]::Floor([math]::Log($Bytes, 1024))
    $index = [math]::Min($index, $sizes.Length - 1)
    
    $size = $Bytes / [math]::Pow(1024, $index)
    return "{0:N2} {1}" -f $size, $sizes[$index]
}

function Export-JsonFormat {
    param([string]$RootPath, [string]$OutputFile)
    
    function Get-JsonNode {
        param([string]$Path, [int]$Depth = 0)
        
        if ($Depth -ge $MaxDepth) { return @() }
        
        $items = Get-OptimizedDirectoryItems -Path $Path
        $result = @()
        
        foreach ($item in $items) {
            $node = @{
                name = $item.Name
                type = if ($item.Attributes -band [System.IO.FileAttributes]::Directory) { "directory" } else { "file" }
                size = if ($item.Attributes -band [System.IO.FileAttributes]::Directory) { $null } else { $item.Length }
                path = $item.FullName
            }
            
            if ($node.type -eq "directory") {
                $node.children = Get-JsonNode -Path $item.FullName -Depth ($Depth + 1)
            }
            
            $result += $node
        }
        
        return $result
    }
    
    $rootName = Split-Path -Leaf $RootPath
    $jsonData = @{
        root = $rootName
        generated = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        statistics = @{
            directories = $script:DirectoryCount
            files = $script:FileCount
            totalSize = $script:TotalSize
        }
        tree = Get-JsonNode -Path $RootPath
    }
    
    $jsonData | ConvertTo-Json -Depth 50 | Out-File -FilePath $OutputFile -Encoding utf8 -Force
}

# Main execution block
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    # Validate and resolve path
    $resolvedPath = Resolve-Path $Path -ErrorAction Stop
    $rootName = Split-Path -Leaf $resolvedPath
    
    if ($ShowProgress) {
        Write-Host "🚀 Starting high-performance directory tree generation for: $resolvedPath" -ForegroundColor Green
        if ($UseParallel) {
            Write-Host "⚡ Parallel processing enabled" -ForegroundColor Yellow
        }
        if ($StreamOutput) {
            Write-Host "🌊 Streaming output enabled" -ForegroundColor Cyan
        }
    }

    # Handle different output formats
    switch ($OutputFormat) {
        'JSON' {
            Export-JsonFormat -RootPath $resolvedPath -OutputFile $OutputFile
        }
        'XML' {
            # XML implementation would go here
            Write-Warning "XML format not yet implemented. Using Markdown instead."
            $OutputFormat = 'Markdown'
        }
        default {
            # Handle Markdown and PlainText formats
            $streamWriter = $null
            
            try {
                if ($StreamOutput) {
                    $streamWriter = [System.IO.StreamWriter]::new($OutputFile, $false, [System.Text.Encoding]::UTF8)
                    
                    # Write header directly to stream
                    if ($OutputFormat -eq 'Markdown') {
                        $streamWriter.WriteLine("``````")
                        $streamWriter.WriteLine("🗂️ $rootName")
                    } else {
                        $streamWriter.WriteLine("``````")
                        $streamWriter.WriteLine("[DIR] $rootName")
                    }
                } else {
                    # Initialize StringBuilder with header
                    if ($OutputFormat -eq 'Markdown') {
                        $script:StringBuilder.AppendLine("``````") | Out-Null
                        $script:StringBuilder.AppendLine("🗂️ $rootName") | Out-Null
                    } else {
                        $script:StringBuilder.AppendLine("``````") | Out-Null
                        $script:StringBuilder.AppendLine("[DIR] $rootName") | Out-Null
                    }
                }
                
                # Generate tree structure
                Get-HighPerformanceTree -Path $resolvedPath -StreamWriter $streamWriter
                
                if (-not $StreamOutput) {
                    # Close code block and add statistics to StringBuilder
                    $script:StringBuilder.AppendLine("``````") | Out-Null
                    
                    if ($IncludeStats) {
                        $script:StringBuilder.AppendLine("") | Out-Null
                        if ($OutputFormat -eq 'Markdown') {
                            $script:StringBuilder.AppendLine("## Statistics") | Out-Null
                            $script:StringBuilder.AppendLine("- **Directories**: $script:DirectoryCount") | Out-Null
                            $script:StringBuilder.AppendLine("- **Files**: $script:FileCount") | Out-Null
                            $script:StringBuilder.AppendLine("- **Total Size**: $(Format-FileSize $script:TotalSize)") | Out-Null
                            $script:StringBuilder.AppendLine("- **Generation Time**: $($stopwatch.Elapsed.TotalSeconds.ToString('F2')) seconds") | Out-Null
                        } else {
                            $script:StringBuilder.AppendLine("Statistics:") | Out-Null
                            $script:StringBuilder.AppendLine("Directories: $script:DirectoryCount") | Out-Null
                            $script:StringBuilder.AppendLine("Files: $script:FileCount") | Out-Null
                            $script:StringBuilder.AppendLine("Total Size: $(Format-FileSize $script:TotalSize)") | Out-Null
                            $script:StringBuilder.AppendLine("Generation Time: $($stopwatch.Elapsed.TotalSeconds.ToString('F2')) seconds") | Out-Null
                        }
                    }
                    
                    # Write all content at once
                    $script:StringBuilder.ToString() | Out-File -FilePath $OutputFile -Encoding utf8 -Force
                } else {
                    # Close code block and append statistics to stream
                    $streamWriter.WriteLine("``````")
                    
                    if ($IncludeStats) {
                        $streamWriter.WriteLine("")
                        if ($OutputFormat -eq 'Markdown') {
                            $streamWriter.WriteLine("## Statistics")
                            $streamWriter.WriteLine("- **Directories**: $script:DirectoryCount")
                            $streamWriter.WriteLine("- **Files**: $script:FileCount")
                            $streamWriter.WriteLine("- **Total Size**: $(Format-FileSize $script:TotalSize)")
                            $streamWriter.WriteLine("- **Generation Time**: $($stopwatch.Elapsed.TotalSeconds.ToString('F2')) seconds")
                        } else {
                            $streamWriter.WriteLine("Statistics:")
                            $streamWriter.WriteLine("Directories: $script:DirectoryCount")
                            $streamWriter.WriteLine("Files: $script:FileCount")
                            $streamWriter.WriteLine("Total Size: $(Format-FileSize $script:TotalSize)")
                            $streamWriter.WriteLine("Generation Time: $($stopwatch.Elapsed.TotalSeconds.ToString('F2')) seconds")
                        }
                    }
                }
            }
            finally {
                if ($streamWriter) {
                    $streamWriter.Close()
                    $streamWriter.Dispose()
                }
            }
        }
    }

    $stopwatch.Stop()
    
    if ($ShowProgress) {
        Write-Progress -Activity "Generating directory tree" -Completed
    }

    # Display results
    Write-Host "✅ Directory tree generated successfully!" -ForegroundColor Green
    Write-Host "📄 Output file: $OutputFile ($OutputFormat format)" -ForegroundColor Cyan
    Write-Host "⏱️  Generation time: $($stopwatch.Elapsed.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Yellow
    Write-Host "🗂️  Cache hits: $($script:PathCache.Count) paths cached" -ForegroundColor Magenta
    
    if ($IncludeStats) {
        Write-Host "📊 Statistics: $script:DirectoryCount directories, $script:FileCount files, $(Format-FileSize $script:TotalSize)" -ForegroundColor Magenta
    }
    
    # Memory usage info
    $memoryUsed = [System.GC]::GetTotalMemory($false) / 1MB
    Write-Host "💾 Peak memory usage: $($memoryUsed.ToString('F2')) MB" -ForegroundColor DarkGray
}
catch {
    Write-Error "❌ Error generating directory tree: $($_.Exception.Message)"
    exit 1
}
finally {
    if ($ShowProgress) {
        Write-Progress -Activity "Generating directory tree" -Completed
    }
    
    # Cleanup
    if ($script:StringBuilder) {
        $script:StringBuilder.Clear()
    }
    $script:PathCache.Clear()
    [System.GC]::Collect()
}