import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, WifiOff, Calendar, TrendingUp, RefreshCw, Shield, Smartphone } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <WifiOff className="text-white" />,
      title: "Offline Functionality",
      description: "Track symptoms and manage appointments even without internet connection",
      bgColor: "bg-medical-blue",
    },
    {
      icon: <Calendar className="text-white" />,
      title: "Appointment Management",
      description: "Schedule and manage appointments with local clinics seamlessly",
      bgColor: "bg-health-green",
    },
    {
      icon: <TrendingUp className="text-white" />,
      title: "Symptom Tracking",
      description: "Monitor your health symptoms with detailed logging and analytics",
      bgColor: "bg-warning-amber",
    },
    {
      icon: <RefreshCw className="text-white" />,
      title: "Data Synchronization",
      description: "Automatically sync with local clinics when connection is available",
      bgColor: "bg-alert-red",
    },
    {
      icon: <Shield className="text-white" />,
      title: "Secure & Private",
      description: "Your health data is encrypted and stored securely",
      bgColor: "bg-medical-blue",
    },
    {
      icon: <Smartphone className="text-white" />,
      title: "Mobile Friendly",
      description: "Responsive design works perfectly on all devices",
      bgColor: "bg-health-green",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-medical-blue to-medical-blue-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Rural Health Tracker & Clinic Link
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Empowering rural communities with offline-first health tracking and seamless clinic connectivity
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-medical-blue px-8 py-3 hover:bg-blue-50">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white px-8 py-3 hover:bg-white hover:text-medical-blue"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-slate-600 dark:text-slate-300 text-lg">
              Comprehensive health management designed for rural healthcare needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-50 dark:bg-slate-700 border-none">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
