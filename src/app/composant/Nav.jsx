import React from 'react'
import '@flaticon/flaticon-uicons/css/all/all.css'
import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="flex justify-between items-center py-4 pl-10">
        {/* logo */}
        <div>
            <Link href="/">
                <img className="h-20" src="/logo.png" alt="" />
            </Link>
        </div>

        {/* icons enregistrer et se connecter */}
        <div className="flex gap-10 pr-10">
            {/* logo enregistrer */}
            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                <i className="fi fi-rr-bookmark text-2xl"></i>
            </div>
            {/* logo se connecter */}
            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                <i className="fi fi-rr-user text-2xl"></i>
            </div>
        </div>
    </nav>
  )
}
