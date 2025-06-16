import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { FaPython, FaReact, FaDatabase } from "react-icons/fa";

export default function About() {
  const offerings = [
    "Offline-first health symptom tracking that works without internet",
    "Seamless appointment scheduling with local healthcare providers", 
    "Automatic data synchronization when connectivity is restored",
    "Secure, HIPAA-compliant data storage and transmission",
  ];

  const techStack = [
    { icon: <FaPython className="text-blue-500" />, name: "Python Backend" },
    { icon: <FaReact className="text-cyan-500" />, name: "React Frontend" },
    { icon: <FaDatabase className="text-orange-500" />, name: "MySQL Database" },
  ];

  return (
    <div className="min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-6">About Rural Health Tracker</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Bridging the healthcare gap in rural communities
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Rural Health Tracker & Clinic Link is designed to address the unique healthcare challenges faced by rural communities. We understand that reliable internet connectivity and access to healthcare facilities can be limited in rural areas.
            </p>

            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300 mb-6">
              {offerings.map((offering, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-health-green mt-1 mr-3 flex-shrink-0" size={20} />
                  <span>{offering}</span>
                </li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold mb-4">Technology Stack</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {techStack.map((tech, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg text-center">
                  <div className="text-3xl mb-2 flex justify-center">{tech.icon}</div>
                  <p className="font-medium">{tech.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
