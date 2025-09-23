#!/bin/bash
echo "🔄 REVERTING MODERN & MINIMALIST DESIGN..."
echo "========================================="
echo ""

# Revert home.css
if [ -f "src/css/home.css.backup-modern-minimalist" ]; then
    cp src/css/home.css.backup-modern-minimalist src/css/home.css
    echo "✅ Reverted src/css/home.css"
else
    echo "❌ Backup file not found: src/css/home.css.backup-modern-minimalist"
fi

echo ""
echo "🔄 REVERT COMPLETE!"
echo "=================="
echo ""
echo "✅ Modern & minimalist design has been reverted"
echo "🌐 Test your reverted homepage: http://localhost:3000"
echo ""
echo "📋 Reverted Files:"
echo "   • src/css/home.css"
echo ""
echo "✨ The React homepage is back to its previous design!"
echo ""
echo "🎯 Original Features Restored:"
echo "   • Previous color scheme"
echo "   • Original typography"
echo "   • Previous styling and effects"
echo "   • Original layout and spacing"
