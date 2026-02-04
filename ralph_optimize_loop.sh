#!/bin/bash

# Ralph Loop - Continuous Codebase Optimization for Claude Code
# This script will run until Claude Code runs out of tokens

echo "🔄 Starting Ralph Loop - Continuous Codebase Optimization"
echo "=================================================="
echo ""

# Counter for iterations
iteration=1

# Function to run Claude Code optimization
run_optimization() {
    local iter=$1
    echo ""
    echo "🔍 Iteration #$iter - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "------------------------------------------------"
    
    # The prompt forces Claude to investigate before optimizing
    claude-code "
INVESTIGATION PHASE:
1. Analyze the entire codebase structure - identify all Phoenix LiveView modules, controllers, and contexts
2. Review the database schema and Ecto schemas - understand data relationships
3. Examine any JavaScript hooks, CSS, and frontend assets
4. Identify code patterns, repetition, and architectural decisions
5. Look for performance bottlenecks, N+1 queries, and inefficient operations
6. Check for security issues, error handling gaps, and edge cases
7. Review test coverage and quality

OPTIMIZATION PHASE:
Based on your investigation, implement ONE meaningful improvement from this priority list:
- Database query optimization (reduce N+1 queries, add indexes, improve preloading)
- Code deduplication (extract common patterns into reusable functions/components)
- Performance improvements (reduce unnecessary re-renders, optimize heavy operations)
- Security enhancements (add CSRF protection, improve input validation)
- Error handling improvements (add proper error boundaries, user-friendly messages)
- Code organization (improve module structure, move logic to contexts)
- Test coverage (add missing tests for critical paths)
- Accessibility improvements (ARIA labels, keyboard navigation)
- Mobile responsiveness fixes (improve touch interactions, responsive layouts)
- Type safety (add typespecs, improve dialyzer coverage)

After implementing the improvement:
1. Run tests to ensure nothing broke
2. Commit changes with a descriptive message
3. Document what was optimized and why
4. Suggest the next optimization opportunity

IMPORTANT: Be thorough in your investigation. Don't make assumptions - actually read the code.
" 2>&1 | tee -a ralph_loop_log_iteration_$iter.txt
    
    return ${PIPESTATUS[0]}
}

# Main loop
while true; do
    echo ""
    echo "🚀 Running optimization iteration #$iteration..."
    
    # Run the optimization
    run_optimization $iteration
    exit_code=$?
    
    # Check if Claude Code failed (likely due to token exhaustion)
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "⚠️  Claude Code returned error code: $exit_code"
        echo "This likely means token budget exhausted or critical error."
        echo ""
        echo "📊 Ralph Loop Summary:"
        echo "Total iterations completed: $iteration"
        echo "Check ralph_loop_log_iteration_*.txt files for detailed logs"
        break
    fi
    
    # Increment iteration counter
    ((iteration++))
    
    # Small delay to avoid hammering the system
    echo ""
    echo "⏳ Waiting 5 seconds before next iteration..."
    sleep 5
done

echo ""
echo "✅ Ralph Loop completed!"
echo "Total optimizations attempted: $iteration"
echo ""
echo "📁 Log files created:"
ls -lh ralph_loop_log_iteration_*.txt 2>/dev/null || echo "No log files found"
echo ""
