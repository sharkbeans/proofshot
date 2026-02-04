#!/bin/bash

# Ralph Loop EXTREME - Maximum Investigation Mode
# Forces Claude to deeply analyze before every optimization

echo "🔥 Starting Ralph Loop EXTREME - Maximum Investigation Mode"
echo "============================================================="
echo ""

iteration=1

run_deep_optimization() {
    local iter=$1
    echo ""
    echo "🔬 DEEP INVESTIGATION Iteration #$iter - $(date '+%Y-%m-%d %H:%M:%S')"
    echo "======================================================================"
    
    claude-code "
🔍 MANDATORY INVESTIGATION PROTOCOL - NO SHORTCUTS ALLOWED

Phase 1: CODEBASE ARCHAEOLOGY (Read ALL files)
- List all .ex, .exs, .heex files and read their contents
- Map out the entire module dependency tree
- Document every LiveView component and its purpose
- Identify all database tables and their relationships
- Find all external API integrations

Phase 2: PATTERN RECOGNITION
- What architectural patterns are being used? (MVC, contexts, boundaries?)
- Are there any anti-patterns or code smells?
- What libraries/dependencies are used and why?
- How is state management handled?
- What's the test strategy?

Phase 3: PERFORMANCE PROFILING
- Identify all database queries - list N+1 query risks
- Find heavy computations or blocking operations
- Check for unnecessary re-renders in LiveView
- Look for missing database indexes
- Analyze asset loading and bundle sizes

Phase 4: QUALITY ASSESSMENT
- Test coverage analysis (what's tested, what's not?)
- Error handling completeness (what could crash?)
- Security audit (XSS, CSRF, SQL injection risks?)
- Accessibility compliance (ARIA, semantic HTML?)
- Mobile UX issues (touch targets, responsive breakpoints?)

Phase 5: TECHNICAL DEBT INVENTORY
- Dead code or unused functions
- TODO/FIXME comments
- Deprecated dependencies
- Inconsistent naming conventions
- Missing documentation

Phase 6: OPTIMIZATION SELECTION & IMPLEMENTATION
Based on your COMPLETE investigation above, choose the HIGHEST IMPACT optimization:

Priority Matrix:
1. Critical bugs/security issues (fix immediately)
2. Performance bottlenecks (10x+ impact)
3. User-facing issues (broken features, bad UX)
4. Code quality (maintainability, testing)
5. Technical debt (cleanup, refactoring)

Implement ONE optimization with:
- Before/after benchmarks (if performance-related)
- Tests proving it works
- Documentation explaining the change
- Git commit with detailed message

Phase 7: POST-OPTIMIZATION VALIDATION
- Run ALL tests (mix test)
- Check for compilation warnings
- Verify the app still starts (mix phx.server)
- Document improvement metrics

Phase 8: NEXT OPPORTUNITY IDENTIFICATION
List the top 3 remaining optimization opportunities for the next iteration.

⚠️  CRITICAL RULE: You MUST actually read files and investigate. No assumptions.
Do not skip the investigation phase. Be thorough. Be curious. Be relentless.
" 2>&1 | tee -a ralph_extreme_iteration_$iter.txt
    
    return ${PIPESTATUS[0]}
}

# Main loop with health checks
while true; do
    echo ""
    echo "🎯 Iteration #$iteration starting..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo "⚠️  Warning: Not in a git repository. Initializing..."
        git init
        git add .
        git commit -m "Initial commit before Ralph Loop optimizations" 2>/dev/null || true
    fi
    
    # Show current stats
    echo "📊 Current Stats:"
    echo "   - Total .ex files: $(find . -name '*.ex' 2>/dev/null | wc -l)"
    echo "   - Total .exs files: $(find . -name '*.exs' 2>/dev/null | wc -l)"
    echo "   - Total .heex files: $(find . -name '*.heex' 2>/dev/null | wc -l)"
    echo "   - Git commits: $(git rev-list --count HEAD 2>/dev/null || echo 0)"
    echo ""
    
    # Run optimization
    run_deep_optimization $iteration
    exit_code=$?
    
    # Check exit status
    if [ $exit_code -ne 0 ]; then
        echo ""
        echo "🛑 Claude Code stopped with exit code: $exit_code"
        echo ""
        echo "📈 RALPH LOOP EXTREME - FINAL REPORT"
        echo "======================================"
        echo "Total iterations: $iteration"
        echo "Log files: ralph_extreme_iteration_*.txt"
        echo ""
        echo "To review optimizations:"
        echo "  git log --oneline"
        echo ""
        echo "To see detailed investigation logs:"
        echo "  cat ralph_extreme_iteration_*.txt"
        break
    fi
    
    ((iteration++))
    
    # Show progress
    echo ""
    echo "✅ Iteration #$((iteration-1)) complete!"
    echo "⏳ 3 second cooldown..."
    sleep 3
done

echo ""
echo "🏁 Ralph Loop EXTREME finished after $iteration iterations"
