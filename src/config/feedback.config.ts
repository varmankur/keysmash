export type QuestionType = 'text' | 'number' | 'textarea' | 'star' | 'radio' | 'checkbox';

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // Used for radio buttons
  min?: number; // Used for number
  max?: number; // Used for number
}

export interface FeedbackConfig {
  branding: {
    eventName: string;
    description: string;
    logoPath: string; // path to logo in public folder
    footerText: string;
  };
  questions: Question[];
}

export const feedbackConfig: FeedbackConfig = {
  branding: {
    eventName: "Tech Workshop 2026",
    description: "We hope you had an amazing time building with us!",
    logoPath: "/lab39-logo.png",
    footerText: "made with ❤️ by lab39.org",
  },
  questions: [
    {
      id: "name",
      type: "text",
      label: "Your Name",
      required: true,
      placeholder: "Tony Stark",
    },
    {
      id: "age",
      type: "number",
      label: "Age",
      required: true,
      placeholder: "14",
      min: 5,
      max: 99,
    },
    {
      id: "school",
      type: "text",
      label: "School Name",
      required: true,
      placeholder: "Midtown High",
    },
    {
      id: "funRating",
      type: "star",
      label: "How much fun did you have?",
      required: true,
    },
    {
      id: "futureWorkshop",
      type: "radio",
      label: "Would you like to join more workshops in the future?",
      required: true,
      options: ["Yes", "No", "Maybe"],
    },
    {
      id: "coolestThing",
      type: "textarea",
      label: "What was the coolest thing you learned today?",
      required: true,
      placeholder: "I learned how to write a prompt...",
    },
    {
      id: "thoughts",
      type: "textarea",
      label: "Any other thoughts? (Optional)",
      required: false,
      placeholder: "It was so fun...",
    },
    {
      id: "consent",
      type: "checkbox",
      label: "I give consent to store my feedback and answers.",
      required: true,
    },
  ],
};
