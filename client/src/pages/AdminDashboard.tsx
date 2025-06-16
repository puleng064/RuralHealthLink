import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Users, Calendar, TrendingUp, Mail, Search, Eye, Edit, Trash2, Shield } from "lucide-react";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  createdAt: string;
  isAdmin: boolean;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json()),
  });

  // Fetch all appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: () => fetch("/api/appointments").then(res => res.json()),
  });

  // Fetch all symptoms  
  const { data: symptoms = [] } = useQuery({
    queryKey: ["/api/symptoms"],
    queryFn: () => fetch("/api/symptoms").then(res => res.json()),
  });

  // Fetch all contacts
  const { data: contacts = [] } = useQuery({
    queryKey: ["/api/contacts"],
    queryFn: () => fetch("/api/contacts").then(res => res.json()),
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "User deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    },
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/contacts/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Message deleted successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete message.", variant: "destructive" });
    },
  });

  const filteredUsers = users.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteUser = (userId: number) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleDeleteContact = (contactId: number) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteContactMutation.mutate(contactId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Admin Header */}
      <div className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="text-2xl" />
              <span className="text-lg font-semibold">Admin Dashboard</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                  <Users className="text-medical-blue text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                  <Calendar className="text-health-green text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Total Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-warning-amber text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Symptom Entries</p>
                  <p className="text-2xl font-bold">{symptoms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-lg flex items-center justify-center">
                  <Mail className="text-alert-red text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Messages</p>
                  <p className="text-2xl font-bold">{contacts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management Table */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {usersLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                            {user.isAdmin ? "Admin" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye size={14} />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit size={14} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.isAdmin}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredUsers.length > 10 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  Showing {Math.min(10, filteredUsers.length)} of {filteredUsers.length} users
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">Previous</Button>
                  <Button size="sm" className="bg-medical-blue hover:bg-medical-blue-dark">1</Button>
                  <Button size="sm" variant="outline">Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Messages */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Contact Messages</h2>
            {contacts.length === 0 ? (
              <p className="text-slate-600 dark:text-slate-300">No messages received yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact: Contact) => (
                  <div key={contact.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{contact.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-500">{formatDate(contact.createdAt)}</span>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteContact(contact.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <Badge variant="outline">{contact.subject}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{contact.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
