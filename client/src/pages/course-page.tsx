import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Course, Content } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, GraduationCap } from "lucide-react";
import { useEffect, useRef } from "react";

// Import Prism CSS only
import "prismjs/themes/prism-tomorrow.css";

export default function CoursePage() {
  const [, params] = useRoute("/courses/:id");
  const courseId = Number(params?.id);

  if (isNaN(courseId)) {
    return <div className="text-center text-red-500">Error: Invalid Course ID</div>;
  }

  const { user } = useAuth();
  const { toast } = useToast();
  const prismLoaded = useRef(false);

  // Initial Prism setup
  useEffect(() => {
    import("prismjs").then((Prism) => {
      prismLoaded.current = true;
      if (content) {
        setTimeout(() => {
          Prism.default.highlightAll();
        }, 0);
      }
    });
  }, []);

  const { data: content } = useQuery<Content[]>({
    queryKey: ["/api/courses", courseId, "content"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/content`);
      if (!res.ok) throw new Error("Failed to fetch course content");
      return res.json();
    },
  });

  useEffect(() => {
    if (content && prismLoaded.current) {
      import("prismjs").then((Prism) => {
        setTimeout(() => {
          Prism.default.highlightAll();
        }, 0);
      });
    }
  }, [content]);

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
  });

  const { data: enrolledCourses } = useQuery<Course[]>({
    queryKey: ["/api/enrollments"],
    queryFn: async () => {
      const res = await fetch(`/api/enrollments`);
      if (!res.ok) throw new Error("Failed to fetch enrollments");
      return res.json();
    },
    enabled: !!user,
  });

  const isEnrolled = Array.isArray(enrolledCourses)
    ? enrolledCourses.some((c) => c?.id === courseId)
    : false;

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/enrollments", {
        courseId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course.",
      });
    },
  });

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Course Header */}
      <div className="relative h-[400px]">
        <img
          src={course.imageUrl}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl mb-6">{course.description}</p>
              {user && !isEnrolled && (
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => enrollMutation.mutate()}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GraduationCap className="mr-2 h-4 w-4" />
                  )}
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            {!isEnrolled && !user?.role?.includes("admin") ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Please enroll in this course to access the content.
                </p>
                {!user && (
                  <Button variant="outline" asChild>
                    <a href="/auth">Sign in to Enroll</a>
                  </Button>
                )}
              </div>
            ) : (
              <Accordion type="single" collapsible>
                {content?.map((item, index) => (
                  <AccordionItem key={item.id} value={item.id.toString()}>
                    <AccordionTrigger>
                      <div className="flex items-center">
                        <span className="mr-4 text-muted-foreground">
                          {index + 1}.
                        </span>
                        {item.title}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: item.content }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

