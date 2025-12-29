import { useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, HandHeart, Lightbulb, ArrowLeft, Send, Loader2, MapPin } from "lucide-react";
import { insertSubmissionSchema, neighborhoods, type SubmissionCategory } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";

const formSchema = insertSubmissionSchema.extend({
  contactEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

const categoryOptions: { value: SubmissionCategory; label: string; description: string; icon: typeof AlertTriangle; color: string; bgColor: string }[] = [
  {
    value: "need",
    label: "I need help / Report a problem",
    description: "Request assistance or report an issue in your community",
    icon: AlertTriangle,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
  },
  {
    value: "offer",
    label: "I can help / Volunteer my time",
    description: "Offer your skills and time to help others",
    icon: HandHeart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
  },
  {
    value: "idea",
    label: "I have an idea to improve the city",
    description: "Share your creative solutions and suggestions",
    icon: Lightbulb,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
  },
];

export default function Submit() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const { toast } = useToast();
  
  const urlCategory = new URLSearchParams(searchParams).get("category") as SubmissionCategory | null;
  const defaultCategory = urlCategory && ["need", "offer", "idea"].includes(urlCategory) 
    ? urlCategory 
    : "need";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: defaultCategory,
      title: "",
      description: "",
      neighborhood: undefined,
      contactName: "",
      contactEmail: "",
      hoursOffered: undefined,
    },
  });

  const selectedCategory = form.watch("category");

  useEffect(() => {
    if (urlCategory && ["need", "offer", "idea"].includes(urlCategory)) {
      form.setValue("category", urlCategory);
    }
  }, [urlCategory, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const cleanedData = {
        ...data,
        contactEmail: data.contactEmail || undefined,
        contactName: data.contactName || undefined,
        hoursOffered: data.hoursOffered || undefined,
        neighborhood: data.neighborhood || undefined,
      };
      return apiRequest("POST", "/api/submissions", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Submission received!",
        description: "Thank you for contributing to your community.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Make a Submission</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>What would you like to do?</CardTitle>
                <CardDescription>
                  Select the type of submission you want to make
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {categoryOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = field.value === option.value;
                            return (
                              <div key={option.value}>
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="peer sr-only"
                                  data-testid={`radio-${option.value}`}
                                />
                                <Label
                                  htmlFor={option.value}
                                  className={`flex items-start gap-4 p-4 rounded-md border-2 cursor-pointer transition-all ${
                                    isSelected 
                                      ? option.bgColor 
                                      : "border-border hover:bg-muted/50"
                                  }`}
                                >
                                  <div className={`p-2 rounded-md ${option.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${option.color}`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {option.description}
                                    </p>
                                  </div>
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
                <CardDescription>
                  Tell us more about your {selectedCategory === "need" ? "request" : selectedCategory === "offer" ? "offer" : "idea"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={
                            selectedCategory === "need" 
                              ? "e.g., Street light broken on Main St" 
                              : selectedCategory === "offer"
                              ? "e.g., Available for tutoring children"
                              : "e.g., Community garden in vacant lot"
                          }
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={
                            selectedCategory === "need"
                              ? "Describe the problem or what kind of help you need..."
                              : selectedCategory === "offer"
                              ? "Describe what you can help with and any relevant skills..."
                              : "Describe your idea and how it could benefit the community..."
                          }
                          className="min-h-32 resize-y"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormDescription>
                        Be as specific as possible to help others understand
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Neighborhood
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-neighborhood">
                            <SelectValue placeholder="Select your neighborhood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {neighborhoods.map((neighborhood) => (
                            <SelectItem key={neighborhood} value={neighborhood} data-testid={`option-${neighborhood.toLowerCase().replace(/\s+/g, '-')}`}>
                              {neighborhood}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Helps match you with others in your area
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory === "offer" && (
                  <FormField
                    control={form.control}
                    name="hoursOffered"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hours you can offer per week</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={40}
                            placeholder="e.g., 5"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            value={field.value ?? ""}
                            data-testid="input-hours"
                          />
                        </FormControl>
                        <FormDescription>
                          Approximately how many hours can you volunteer each week?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Optional - helps others reach out to you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., John Smith" 
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="e.g., john@example.com" 
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-end">
              <Link href="/">
                <Button type="button" variant="outline" className="w-full sm:w-auto" data-testid="button-cancel">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                className="w-full sm:w-auto"
                data-testid="button-submit"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
