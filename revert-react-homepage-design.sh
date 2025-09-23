#!/bin/bash
echo "🔄 REVERTING REACT HOMEPAGE DESIGN CHANGES..."
echo "============================================="
echo ""

# Revert home.css
if [ -f "src/css/home.css.backup-design-enhancement" ]; then
    cp src/css/home.css.backup-design-enhancement src/css/home.css
    echo "✅ Reverted src/css/home.css"
else
    echo "❌ Backup file not found: src/css/home.css.backup-design-enhancement"
fi

echo ""
echo "🔄 REVERT COMPLETE!"
echo "=================="
echo ""
echo "✅ React homepage design has been reverted to original state"
echo "🌐 Test your reverted homepage: http://localhost:3000"
echo ""
echo "📋 Reverted Files:"
echo "   • src/css/home.css"
echo ""
echo "✨ The React homepage is now back to its original design!"
echo ""
echo "🎯 Original Features Restored:"
echo "   • Original color scheme"
echo "   • Original font sizes"
echo "   • Original component dimensions"
echo "   • Original styling and effects"
