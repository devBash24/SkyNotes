import { LogIn, LogOut, MenuIcon } from "lucide-react"
import { NavigationMenu,NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {NotebookPen,NotebookIcon} from 'lucide-react'


type ApplicationHeaderProps = {
  currentPath: string
  currentHash: string
  onSignOut: () => Promise<void>
  onSignIn: () => void
  onAddEntry: () => void
  isAuthenticated: boolean
  isAuthLoading: boolean
}

const isActiveLink = (currentPath: string, currentHash: string, href: string) => {
  if (href.startsWith("#")) {
    if (!currentHash && href === "#overview") {
      return true
    }

    return currentHash === href
  }

  return currentPath === href
}

export const ApplicationHeader = ({
  currentPath,
  currentHash,
  onSignOut,
  onSignIn,
  onAddEntry,
  isAuthenticated,
  isAuthLoading,
}: ApplicationHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-center gap-3 text-sm font-medium text-foreground">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/60 bg-primary/10 text-primary">
          <img
          src="/skynotes-32x32.png"   // <-- place your generated icon in public/ as favicon.png
          alt="SkyNotes Logo"
          className="h-8 w-8"
        />
          </div>
          <div className="flex flex-col leading-snug">
            <span className="text-sm font-semibold">SkyNotes</span>
            <span className="text-xs text-muted-foreground">Daily reflections</span>
          </div>
        </a>
        <div className="hidden items-center gap-4 md:flex">
          <NavigationMenu>
            <NavigationMenuList>
            <Button
                key={'/'}
                  variant={isActiveLink(currentPath, currentHash,'/') ? "secondary" : "ghost"}
                  className="justify-start text-sm"
                >
                    <NotebookIcon className="size-4"/>
                  Journal
                  
                </Button>
                <Button variant={isActiveLink(currentPath, currentHash,'/entries/new') ? "secondary" : "ghost"} className=" gap-2"  onClick={onAddEntry} disabled={isAuthLoading}>
                  <NotebookPen className="size-4" />
                  New entry
                </Button>
            </NavigationMenuList>
          </NavigationMenu>
          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => {
                void onSignOut()
              }}
              disabled={isAuthLoading}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          ) : (
            <Button variant="default" size="sm" className="h-9 gap-2" onClick={onSignIn} disabled={isAuthLoading}>
              <LogIn className="size-4" />
              Sign in
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <MenuIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-border/60">
              <SheetHeader>
                <SheetTitle>SkyNotes</SheetTitle>
                <SheetDescription>Navigate through your reflections.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                <Button
                key={'/'}
                  variant={isActiveLink(currentPath, currentHash,'/') ? "secondary" : "ghost"}
                  className="justify-start text-sm"
                >
                    <NotebookIcon className="size-4"/>
                  Journal
                  
                </Button>
                <Button variant="default" className="w-full gap-2" onClick={onAddEntry} disabled={isAuthLoading}>
                  <NotebookPen className="size-4" />
                  New entry
                </Button>
              </nav>
              <div className="mt-auto space-y-2 px-4 pb-6">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      void onSignOut()
                    }}
                    disabled={isAuthLoading}
                  >
                    <LogOut className="size-4" />
                    Sign out
                  </Button>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
