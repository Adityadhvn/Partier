import React, { useState } from "react";
import { Loader2, Shield, Check, X, User, ChevronDown, ChevronUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Label } from "@/components/ui/label";

export default function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedUser, setExpandedUser] = useState<number | null>(null);

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      if (!user?.isSuperAdmin) {
        throw new Error("Not authorized");
      }
      return fetch("/api/users").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      });
    },
    enabled: !!user?.isSuperAdmin, // Only fetch if the user is a super admin
  });

  // Update organizer status
  const updateOrganizerStatus = useMutation({
    mutationFn: async ({ userId, isOrganizer }: { userId: number; isOrganizer: boolean }) => {
      const res = await fetch(`/api/users/${userId}/organizer-status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOrganizer }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update organizer status");
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User organizer status updated successfully",
        variant: "default",
      });
      // Invalidate users query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/auth");
    } else if (!authLoading && user && !user.isSuperAdmin) {
      setLocation("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
    }
  }, [authLoading, user, setLocation]);

  const toggleExpandUser = (userId: number) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };

  if (authLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user?.isSuperAdmin) {
    // Instead of returning null, show an unauthorized message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
        <p className="text-muted-foreground text-center mb-6">
          You don't have permission to access the admin panel
        </p>
        <Button variant="outline" onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage platform access for organizers
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground">
          <Shield className="h-4 w-4" />
          Super Admin
        </Badge>
      </div>

      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Control which users have organizer privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <ul className="space-y-4">
              {users.map((u: any) => (
                <li key={u.id} className="bg-card rounded-lg border overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleExpandUser(u.id)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{u.fullName}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {u.isOrganizer ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Organizer</Badge>
                      ) : (
                        <Badge variant="outline">Regular User</Badge>
                      )}
                      {u.isSuperAdmin && (
                        <Badge className="bg-primary hover:bg-primary text-primary-foreground">Super Admin</Badge>
                      )}
                      {expandedUser === u.id ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {expandedUser === u.id && (
                    <div className="p-4 border-t">
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-1">Username</p>
                        <p className="text-muted-foreground">{u.username}</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor={`organizer-switch-${u.id}`}>Organizer Status</Label>
                          <p className="text-sm text-muted-foreground">
                            {u.isOrganizer 
                              ? "Can create and manage events"
                              : "Cannot create or manage events"}
                          </p>
                        </div>
                        <Switch
                          id={`organizer-switch-${u.id}`}
                          checked={u.isOrganizer}
                          disabled={u.isSuperAdmin || updateOrganizerStatus.isPending}
                          onCheckedChange={(checked) => {
                            updateOrganizerStatus.mutate({ 
                              userId: u.id, 
                              isOrganizer: checked 
                            });
                          }}
                        />
                      </div>
                      {u.isSuperAdmin && (
                        <p className="text-xs text-amber-600 mt-2">
                          Super admin status cannot be modified through the UI
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/20 border-t">
          <p className="text-xs text-muted-foreground">
            {users ? users.length : 0} users in the system
          </p>
          <div className="flex items-center gap-1">
            <p className="text-xs text-muted-foreground">
              Organizers: {users ? users.filter((u: any) => u.isOrganizer).length : 0}
            </p>
            <Separator orientation="vertical" className="h-4 mx-2" />
            <p className="text-xs text-muted-foreground">
              Regular users: {users ? users.filter((u: any) => !u.isOrganizer).length : 0}
            </p>
          </div>
        </CardFooter>
      </Card>

      <div className="text-center">
        <Button variant="outline" onClick={() => setLocation("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}