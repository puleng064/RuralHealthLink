import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertAppointmentSchema, insertSymptomSchema, type InsertAppointment, type InsertSymptom, type Appointment, type Symptom } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { Calendar, TrendingUp, RefreshCw, Wifi, CalendarPlus, Plus, History, UserCog, Edit, X, Thermometer } from "lucide-react";

type DashboardSection = "overview" | "appointments" | "symptoms" | "history" | "profile";

export default function UserDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

  // Fetch user appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", user?.id],
    queryFn: () => fetch(`/api/appointments?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch user symptoms
  const { data: symptoms = [], isLoading: symptomsLoading } = useQuery({
    queryKey: ["/api/symptoms", user?.id],
    queryFn: () => fetch(`/api/symptoms?userId=${user?.id}`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Appointment form
  const appointmentForm = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      userId: user?.id || 0,
      date: "",
      time: "",
      provider: "",
      type: "",
      reason: "",
    },
  });

  // Symptom form
  const symptomForm = useForm<InsertSymptom>({
    resolver: zodResolver(insertSymptomSchema),
    defaultValues: {
      userId: user?.id || 0,
      dateTime: "",
      category: "",
      description: "",
      severity: 1,
      notes: "",
    },
  });

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: (data: InsertAppointment) => apiRequest("POST", "/api/appointments", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment booked successfully!" });
      appointmentForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to book appointment.", variant: "destructive" });
    },
  });

  // Create symptom mutation
  const createSymptomMutation = useMutation({
    mutationFn: (data: InsertSymptom) => apiRequest("POST", "/api/symptoms", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Symptom logged successfully!" });
      symptomForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/symptoms"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to log symptom.", variant: "destructive" });
    },
  });

  // Delete appointment mutation
  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/appointments/${id}`),
    onSuccess: () => {
      toast({ title: "Success", description: "Appointment cancelled successfully!" });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to cancel appointment.", variant: "destructive" });
    },
  });

  const onSubmitAppointment = (data: InsertAppointment) => {
    createAppointmentMutation.mutate({ ...data, userId: user?.id || 0 });
  };

  const onSubmitSymptom = (data: InsertSymptom) => {
    createSymptomMutation.mutate({ ...data, userId: user?.id || 0 });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "text-health-green bg-green-50 dark:bg-green-950";
      case 2: return "text-warning-amber bg-yellow-50 dark:bg-yellow-950";
      case 3: return "text-alert-red bg-red-50 dark:bg-red-950";
      default: return "text-slate-600 bg-slate-50 dark:bg-slate-800";
    }
  };

  const getSeverityLabel = (severity: number) => {
    switch (severity) {
      case 1: return "Mild";
      case 2: return "Moderate";
      case 3: return "Severe";
      default: return "Unknown";
    }
  };

  if (!user) {
    return <div>Please log in to access your dashboard.</div>;
  }

  const upcomingAppointments = appointments.filter((apt: Appointment) => 
    new Date(apt.date) >= new Date()
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">User Dashboard</span>
              <span className="text-sm text-slate-500">@{user.username}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === "overview" && (
          <>
            {/* Dashboard Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 rounded-lg flex items-center justify-center">
                      <Calendar className="text-medical-blue text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Upcoming Appointments</p>
                      <p className="text-2xl font-bold">{upcomingAppointments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-health-green text-xl" />
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
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-950 rounded-lg flex items-center justify-center">
                      <RefreshCw className="text-warning-amber text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Last Sync</p>
                      <p className="text-sm font-medium">Just now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-950 rounded-lg flex items-center justify-center">
                      <Wifi className="text-health-green text-xl" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-slate-600 dark:text-slate-300">Connection Status</p>
                      <p className="text-sm font-medium text-health-green">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => setActiveSection("appointments")}
                      className="bg-medical-blue hover:bg-medical-blue-dark p-4 h-auto flex-col space-y-2"
                    >
                      <CalendarPlus className="text-2xl" />
                      <span className="text-sm font-medium">Book Appointment</span>
                    </Button>
                    <Button
                      onClick={() => setActiveSection("symptoms")}
                      className="bg-health-green hover:bg-health-green-dark p-4 h-auto flex-col space-y-2"
                    >
                      <Plus className="text-2xl" />
                      <span className="text-sm font-medium">Log Symptoms</span>
                    </Button>
                    <Button
                      onClick={() => setActiveSection("history")}
                      className="bg-warning-amber hover:bg-yellow-600 p-4 h-auto flex-col space-y-2"
                    >
                      <History className="text-2xl" />
                      <span className="text-sm font-medium">View History</span>
                    </Button>
                    <Button
                      onClick={() => setActiveSection("profile")}
                      variant="outline"
                      className="p-4 h-auto flex-col space-y-2"
                    >
                      <UserCog className="text-2xl" />
                      <span className="text-sm font-medium">Profile</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
                  <div className="space-y-4">
                    {appointments.slice(0, 3).map((appointment: Appointment) => (
                      <div key={appointment.id} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Calendar className="text-medical-blue mr-3" size={20} />
                        <div>
                          <p className="font-medium text-sm">Appointment with {appointment.provider}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {formatDate(appointment.date)} at {appointment.time}
                          </p>
                        </div>
                      </div>
                    ))}
                    {symptoms.slice(0, 2).map((symptom: Symptom) => (
                      <div key={symptom.id} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <Thermometer className="text-health-green mr-3" size={20} />
                        <div>
                          <p className="font-medium text-sm">Symptom logged: {symptom.description}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300">
                            {formatDate(symptom.dateTime)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeSection === "appointments" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Appointments</h2>
              <Button onClick={() => setActiveSection("overview")} variant="outline">
                Back to Overview
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Book New Appointment</h3>
                <Form {...appointmentForm}>
                  <form onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)} className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="09:00">9:00 AM</SelectItem>
                              <SelectItem value="10:00">10:00 AM</SelectItem>
                              <SelectItem value="11:00">11:00 AM</SelectItem>
                              <SelectItem value="14:00">2:00 PM</SelectItem>
                              <SelectItem value="15:00">3:00 PM</SelectItem>
                              <SelectItem value="16:00">4:00 PM</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="provider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Healthcare Provider</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Dr. Sarah Smith - General Practice">Dr. Sarah Smith - General Practice</SelectItem>
                              <SelectItem value="Dr. Michael Johnson - Cardiology">Dr. Michael Johnson - Cardiology</SelectItem>
                              <SelectItem value="Dr. Emily Davis - Pediatrics">Dr. Emily Davis - Pediatrics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={appointmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Regular Checkup">Regular Checkup</SelectItem>
                              <SelectItem value="Follow-up">Follow-up</SelectItem>
                              <SelectItem value="Consultation">Consultation</SelectItem>
                              <SelectItem value="Emergency">Emergency</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2">
                      <FormField
                        control={appointmentForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason for Visit</FormLabel>
                            <FormControl>
                              <Textarea
                                rows={3}
                                placeholder="Please describe your symptoms or reason for the appointment..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        className="bg-medical-blue hover:bg-medical-blue-dark"
                        disabled={createAppointmentMutation.isPending}
                      >
                        {createAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Appointments</h3>
                {appointmentsLoading ? (
                  <p>Loading appointments...</p>
                ) : appointments.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-300">No appointments scheduled.</p>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment: Appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.provider}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(appointment.date)} at {appointment.time}
                          </p>
                          <p className="text-xs text-slate-500">{appointment.type}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit size={14} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteAppointmentMutation.mutate(appointment.id)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "symptoms" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Symptom Tracker</h2>
              <Button onClick={() => setActiveSection("overview")} variant="outline">
                Back to Overview
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Log New Symptom</h3>
                <Form {...symptomForm}>
                  <form onSubmit={symptomForm.handleSubmit(onSubmitSymptom)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={symptomForm.control}
                        name="dateTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date & Time</FormLabel>
                            <FormControl>
                              <Input type="datetime-local" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={symptomForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symptom Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Pain">Pain</SelectItem>
                                <SelectItem value="Fever">Fever</SelectItem>
                                <SelectItem value="Respiratory">Respiratory</SelectItem>
                                <SelectItem value="Digestive">Digestive</SelectItem>
                                <SelectItem value="Mental Health">Mental Health</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={symptomForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Symptom Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Mild headache, Upper back pain" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={symptomForm.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity Level (1-3)</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select severity" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Mild (1)</SelectItem>
                                <SelectItem value="2">Moderate (2)</SelectItem>
                                <SelectItem value="3">Severe (3)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={symptomForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={3}
                              placeholder="Any additional information about the symptom..."
                              value={field.value || ""}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="bg-health-green hover:bg-health-green-dark"
                      disabled={createSymptomMutation.isPending}
                    >
                      {createSymptomMutation.isPending ? "Logging..." : "Log Symptom"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Recent Symptoms */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Symptoms</h3>
                {symptomsLoading ? (
                  <p>Loading symptoms...</p>
                ) : symptoms.length === 0 ? (
                  <p className="text-slate-600 dark:text-slate-300">No symptoms logged yet.</p>
                ) : (
                  <div className="space-y-3">
                    {symptoms.map((symptom: Symptom) => (
                      <div key={symptom.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{symptom.description}</span>
                          <span className="text-sm text-slate-500">{formatDate(symptom.dateTime)}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(symptom.severity)}`}>
                            {getSeverityLabel(symptom.severity)}
                          </span>
                          <span className="text-xs text-slate-600 dark:text-slate-300">{symptom.category} category</span>
                        </div>
                        {symptom.notes && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{symptom.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === "history" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Health History</h2>
              <Button onClick={() => setActiveSection("overview")} variant="outline">
                Back to Overview
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Appointment History</h3>
                  {appointments.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-300">No appointment history available.</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments.map((appointment: Appointment) => (
                        <div key={appointment.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <p className="font-medium">{appointment.provider}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(appointment.date)} - {appointment.type}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Symptom History</h3>
                  {symptoms.length === 0 ? (
                    <p className="text-slate-600 dark:text-slate-300">No symptom history available.</p>
                  ) : (
                    <div className="space-y-3">
                      {symptoms.map((symptom: Symptom) => (
                        <div key={symptom.id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <p className="font-medium">{symptom.description}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {formatDate(symptom.dateTime)} - {symptom.category}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${getSeverityColor(symptom.severity)}`}>
                            {getSeverityLabel(symptom.severity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeSection === "profile" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <Button onClick={() => setActiveSection("overview")} variant="outline">
                Back to Overview
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">First Name</label>
                    <Input value={user.firstName} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Last Name</label>
                    <Input value={user.lastName} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <Input value={user.username} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input value={user.email} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Gender</label>
                    <Input value={user.gender} readOnly />
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">
                  Profile editing will be available in a future update.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
