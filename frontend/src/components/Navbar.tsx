import { Link, useLocation } from "react-router-dom";
import { Code2, BookOpen, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const routes = [
    {
      href: "/",
      label: "Learn",
      icon: BookOpen,
      active: location.pathname === "/" || location.pathname.startsWith("/learn"),
    },
    {
      href: "/problems",
      label: "Practice",
      icon: Code2,
      active: location.pathname.startsWith("/problem"),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <Code2 className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Hack the Algorithm
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  route.active ? "text-foreground" : "text-foreground/60"
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetHeader>
              <SheetTitle className="text-left">
                <Link
                  to="/"
                  className="flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Code2 className="mr-2 h-4 w-4" />
                  <span className="font-bold">Hack the Algorithm</span>
                </Link>
              </SheetTitle>
            </SheetHeader>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    to={route.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-muted-foreground hover:text-primary",
                      route.active && "text-foreground font-medium"
                    )}
                  >
                    {route.label}
                  </Link>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search placeholder or other actions */}
          </div>
        </div>
      </div>
    </header>
  );
}
