
import { Code, LogOut, User, History, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Function to scroll to section or change tab
  const navigateTo = (tabId: string) => {
    const tabsElement = document.querySelector(`[value="${tabId}"]`);
    if (tabsElement) {
      (tabsElement as HTMLElement).click();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/logo.svg" 
              alt="Structure from Sight Logo" 
              className="h-8 w-8" 
            />
            <span className="font-bold text-xl">Structure from Sight</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => navigate("/history")}
                >
                  <History className="mr-2 h-4 w-4" />
                  My History
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2 gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">My Account</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/history")}>
                      <FolderOpen className="mr-2 h-4 w-4" />
                      <span>My Structures</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => {
                      await signOut();
                      navigate("/");
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={() => navigate("/auth")}
                >
                  Sign In
                </Button>
                <Button 
                  size="sm" 
                  className="ml-2"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  Get Started
                </Button>
              </>
            )}
          </nav>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => {
              const menu = document.createElement('div');
              menu.className = 'fixed inset-0 bg-white z-50 p-4';
              menu.innerHTML = `
                <div class="flex justify-end">
                  <button class="p-2" id="close-menu">×</button>
                </div>
                <div class="flex flex-col space-y-4 mt-8">
                  ${user 
                    ? `<button class="text-left p-2 hover:bg-gray-100 rounded" data-action="structures">My Structures</button>
                       <button class="text-left p-2 hover:bg-gray-100 rounded" data-action="logout">Log out</button>`
                    : `<button class="text-left p-2 hover:bg-gray-100 rounded" data-action="signin">Sign In</button>
                       <button class="text-left p-2 bg-blue-600 text-white rounded" data-action="signup">Get Started</button>`
                  }
                </div>
              `;
              document.body.appendChild(menu);
              
              // Add event listeners
              document.getElementById('close-menu')?.addEventListener('click', () => {
                document.body.removeChild(menu);
              });
              
              menu.querySelectorAll('[data-action]').forEach(button => {
                button.addEventListener('click', (e) => {
                  const action = (e.currentTarget as HTMLElement).getAttribute('data-action');
                  if (action === 'signin') navigate("/auth");
                  if (action === 'signup') navigate("/auth?tab=signup");
                  if (action === 'structures') navigateTo("try");
                  if (action === 'logout') signOut();
                  document.body.removeChild(menu);
                });
              });
            }}
          >
            <Code className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
