import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const { data: courses } = useQuery<Course[]>({ queryKey: ["/api/courses"] });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
          alt="Coding Education"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-6">Master Coding with Expert-Led Courses</h1>
              <p className="text-xl mb-8">
                Start your journey to becoming a professional developer with our comprehensive
                curriculum and hands-on projects.
              </p>
              <div className="space-x-4">
                {user ? (
                  <Link href="/dashboard">
                    <Button size="lg" variant="secondary">Go to Dashboard</Button>
                  </Link>
                ) : (
                  <Link href="/auth">
                    <Button size="lg" variant="secondary">Get Started</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Listing */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">Featured Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <img
                  src={course.imageUrl}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{course.description}</p>
              </CardContent>
              <CardFooter>
                <Link href={`/courses/${course.id}`}>
                  <Button className="w-full">Learn More</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose CodeEd?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Expert Instructors</h3>
              <p className="text-muted-foreground">Learn from industry professionals with years of experience.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Hands-on Projects</h3>
              <p className="text-muted-foreground">Build real-world applications as you learn.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Community Support</h3>
              <p className="text-muted-foreground">Join a community of learners and get help when you need it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
