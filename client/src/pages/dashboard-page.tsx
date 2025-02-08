import { useQuery } from "@tanstack/react-query";
import { Course } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: enrolledCourses, isLoading } = useQuery<{ course: Course }[]>({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-muted-foreground">
              Track your progress and continue learning.
            </p>
          </div>
          {user?.role === "admin" && (
            <Link href="/admin">
              <Button>Admin Dashboard</Button>
            </Link>
          )}
        </div>

        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses?.length ? (
              enrolledCourses.map(({ course }) => {
                if (!course) return null; // Pastikan course tidak undefined

                return (
                  <Card key={course.id}>
                    <CardHeader>
                      {course.imageUrl ? (
                        <img
                          src={course.imageUrl}
                          alt={course.title || "Course Image"}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-gray-500">
                          No Image Available
                        </div>
                      )}
                      <CardTitle>{course.title || "Untitled Course"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} />
                      </div>
                      <Link href={`/courses/${course.id}`}>
                        <Button className="w-full">Continue Learning</Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground mb-4">
                    You haven't enrolled in any courses yet.
                  </p>
                  <Link href="/">
                    <Button className="w-full">Browse Courses</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

