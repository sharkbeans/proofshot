# Ralph Loop - Claude Code Continuous Optimization Scripts

## Overview

These scripts create a "Ralph loop" (continuous optimization cycle) that forces Claude Code to investigate your Phoenix LiveView codebase deeply and optimize it iteratively until the token budget is exhausted.

## Scripts Available

### 1. `ralph_optimize_loop.sh` - Standard Mode
**Best for:** Balanced optimization with reasonable investigation depth

**Features:**
- Systematic investigation of codebase structure
- One meaningful improvement per iteration
- Automatic test running and git commits
- Progress logging for each iteration

**Usage:**
```bash
cd /path/to/your/phoenix/project
/home/claude/ralph_optimize_loop.sh
```

### 2. `ralph_extreme_loop.sh` - EXTREME Mode
**Best for:** Maximum optimization, comprehensive analysis, token exhaustion speedrun

**Features:**
- 8-phase mandatory investigation protocol
- Deep architectural analysis required
- Performance profiling and security audits
- Technical debt inventory
- Priority-based optimization selection
- Post-optimization validation
- Enhanced progress tracking

**Usage:**
```bash
cd /path/to/your/phoenix/project
/home/claude/ralph_extreme_loop.sh
```

## How It Works

### Investigation-First Approach
Both scripts force Claude Code to:

1. **Actually read your code** - No assumptions allowed
2. **Understand the architecture** - Map dependencies and patterns
3. **Identify issues** - Find bugs, performance problems, security risks
4. **Prioritize improvements** - Select highest-impact optimizations
5. **Implement changes** - Make one meaningful improvement per iteration
6. **Validate results** - Run tests and verify nothing broke
7. **Document progress** - Git commits and detailed logs

### Token Exhaustion Strategy
The loop continues until Claude Code runs out of tokens because:
- Each iteration requires reading files (uses tokens)
- Deep analysis and reasoning (uses tokens)
- Code generation and testing (uses tokens)
- This ensures maximum value from your token budget

## What Gets Optimized

The scripts target improvements in this priority order:

1. **Critical Issues**
   - Security vulnerabilities
   - Broken functionality
   - Data integrity problems

2. **Performance**
   - N+1 query elimination
   - Database index additions
   - Unnecessary re-renders
   - Heavy operation optimization

3. **Code Quality**
   - Deduplication
   - Better error handling
   - Improved organization
   - Type safety

4. **User Experience**
   - Mobile responsiveness
   - Accessibility
   - Loading states
   - Error messages

5. **Technical Debt**
   - Dead code removal
   - Test coverage
   - Documentation
   - Code consistency

## Output Files

### Log Files
- `ralph_loop_log_iteration_N.txt` - Standard mode logs
- `ralph_extreme_iteration_N.txt` - Extreme mode logs

Each log contains:
- Investigation findings
- Optimization implemented
- Test results
- Next opportunities

### Git History
All optimizations are committed with descriptive messages. Review with:
```bash
git log --oneline
git show <commit-hash>
```

## Tips for Maximum Effectiveness

### Before Running
1. **Commit your current work**
   ```bash
   git add .
   git commit -m "Before Ralph Loop optimization"
   ```

2. **Make sure tests pass**
   ```bash
   mix test
   ```

3. **Have a backup branch**
   ```bash
   git checkout -b pre-ralph-optimization
   git checkout main
   ```

### During Execution
- Let it run uninterrupted
- Monitor the output for patterns
- Check log files if you want details

### After Completion
1. **Review changes**
   ```bash
   git log --oneline --since="1 hour ago"
   git diff HEAD~10..HEAD  # See last 10 commits
   ```

2. **Run full test suite**
   ```bash
   mix test
   ```

3. **Test the application manually**
   ```bash
   mix phx.server
   ```

4. **Cherry-pick optimizations** (if needed)
   ```bash
   git cherry-pick <commit-hash>
   ```

## Expected Results

### Standard Mode
- **Iterations:** 10-30 depending on token budget
- **Duration:** 30-90 minutes
- **Focus:** Balanced improvements across all areas

### Extreme Mode
- **Iterations:** 5-15 (more thorough per iteration)
- **Duration:** 1-3 hours
- **Focus:** Deep analysis, highest-impact changes

## Stopping the Loop

The loop automatically stops when:
- Claude Code runs out of tokens
- Claude Code encounters an error
- All obvious optimizations are complete

To manually stop:
- Press `Ctrl+C`

## Safety Features

- Git commits after each optimization
- Test validation before proceeding
- Detailed logging for rollback
- Error detection and reporting

## Troubleshooting

### "Not in a git repository"
The extreme mode will initialize one automatically. Standard mode requires manual init:
```bash
git init
git add .
git commit -m "Initial commit"
```

### "Claude Code not found"
Make sure Claude Code is installed and in your PATH:
```bash
which claude-code
```

### "Tests failing after optimization"
Check the specific iteration log:
```bash
cat ralph_extreme_iteration_X.txt
```

Roll back the problematic commit:
```bash
git revert <commit-hash>
```

## Philosophy

The Ralph Loop embodies:
- **Continuous improvement** over one-time fixes
- **Investigation before optimization** 
- **Measurable results** over guesswork
- **Automated excellence** over manual tedium

## Token Budget Strategy

Claude Code Pro tips:
- Each investigation uses ~5,000-10,000 tokens
- Each optimization uses ~10,000-20,000 tokens
- Extreme mode uses 2-3x more tokens per iteration
- Total optimizations: ~10-30 depending on mode

## Contributing Optimizations

After the loop completes, you can:
1. Review all changes: `git log --stat`
2. Create a summary report: `git log --oneline > optimization_summary.txt`
3. Share successful patterns with your team
4. Run the loop again on different codebases

---

**Note:** These scripts are designed for Phoenix LiveView projects but can be adapted for other Elixir/Erlang projects by modifying the investigation prompts.

**Created for:** Juny's e-maintenance system optimization
**Last Updated:** January 2026
