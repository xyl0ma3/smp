import React, { useState, useRef, useEffect } from 'react'
import {
  Home,
  Search,
  Bell,
  Bookmark,
  Heart,
  User,
  Settings,
  LogOut,
  MoreHorizontal,
  Share2,
  Flag
} from 'lucide-react'

export default function DropdownMenu({ 
  items = [],
  align = 'left',
  trigger,
  onSelect,
  className = ''
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const handleSelect = (item) => {
    setOpen(false)
    onSelect?.(item)
  }

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger button */}
      {trigger ? (
        <button onClick={() => setOpen((s) => !s)} className="hover:bg-gray-100 dark:hover:bg-twitter-800 rounded-full p-2 transition-colors">
          {trigger}
        </button>
      ) : (
        <button
          onClick={() => setOpen((s) => !s)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors text-gray-500 hover:text-twitter-600 dark:hover:text-twitter-400"
          title="Menu"
        >
          <MoreHorizontal size={18} />
        </button>
      )}

      {/* Dropdown menu */}
      {open && (
        <div className={`absolute ${alignmentClass} top-10 z-50 w-56 bg-white dark:bg-twitter-900 border border-gray-200 dark:border-twitter-800 rounded-lg shadow-xl py-2 menu-anim`}>
          {items.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
              Sin opciones disponibles
            </div>
          ) : (
            items.map((item, index) => (
              <button
                key={item.id || index}
                onClick={() => handleSelect(item)}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors text-sm font-medium
                  ${item.danger
                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:bg-opacity-20'
                    : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-twitter-800'
                  }
                `}
              >
                {item.icon && <item.icon size={16} />}
                <span>{item.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
