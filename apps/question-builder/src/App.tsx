"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { create } from "zustand"
import { FiPlus, FiEdit, FiTrash2, FiCheck, FiX } from "react-icons/fi"
import clsx from "clsx"
import "./styles/globals.css"

// Zod schemas
const questionSchema = z.object({
  type: z.enum(["multiple-choice", "true-false", "short-answer"]),
  question: z.string().min(1, "Question is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().min(1, "Category is required"),
})

type QuestionForm = z.infer<typeof questionSchema>

interface Question extends QuestionForm {
  id: string
  createdAt: Date
}

// Zustand store
interface QuestionStore {
  questions: Question[]
  addQuestion: (question: Omit<Question, "id" | "createdAt">) => void
  updateQuestion: (id: string, question: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  getQuestionsByCategory: (category: string) => Question[]
}

const useQuestionStore = create<QuestionStore>((set, get) => ({
  questions: [
    {
      id: "1",
      type: "multiple-choice",
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: "Paris",
      difficulty: "easy",
      category: "Geography",
      createdAt: new Date(),
    },
    {
      id: "2",
      type: "true-false",
      question: "The Earth is flat.",
      correctAnswer: "False",
      difficulty: "easy",
      category: "Science",
      createdAt: new Date(),
    },
  ],
  addQuestion: (question) =>
    set((state) => ({
      questions: [
        ...state.questions,
        {
          ...question,
          id: Date.now().toString(),
          createdAt: new Date(),
        },
      ],
    })),
  updateQuestion: (id, updatedQuestion) =>
    set((state) => ({
      questions: state.questions.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q)),
    })),
  deleteQuestion: (id) =>
    set((state) => ({
      questions: state.questions.filter((q) => q.id !== id),
    })),
  getQuestionsByCategory: (category) => get().questions.filter((q) => q.category === category),
}))

const QuestionBuilderApp: React.FC = () => {
  const { questions, addQuestion, deleteQuestion } = useQuestionStore()
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      type: "multiple-choice",
      options: ["", "", "", ""],
      difficulty: "medium",
    },
  })

  const questionType = watch("type")
  const options = watch("options")

  const onSubmit = (data: QuestionForm) => {
    addQuestion(data)
    reset({
      type: "multiple-choice",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      difficulty: "medium",
      category: "",
    })
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(options || [])]
    newOptions[index] = value
    setValue("options", newOptions)
  }

  const categories = Array.from(new Set(questions.map((q) => q.category)))
  const filteredQuestions =
    selectedCategory === "all" ? questions : questions.filter((q) => q.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage questions with advanced validation</p>
        </div>
        <div className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
          React + TypeScript + Zod + Zustand
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Question Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiPlus className="text-blue-500" />
              Create Question
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question Type</label>
                <select {...register("type")} className="input">
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  {...register("category")}
                  type="text"
                  className={clsx("input", errors.category && "border-red-500")}
                  placeholder="e.g., Mathematics, Science"
                />
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select {...register("difficulty")} className="input">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  {...register("question")}
                  className={clsx("input h-24", errors.question && "border-red-500")}
                  placeholder="Enter your question here..."
                />
                {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>}
              </div>

              {questionType === "multiple-choice" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Options</label>
                  {options?.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="input mb-2"
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <input
                  {...register("correctAnswer")}
                  type="text"
                  className={clsx("input", errors.correctAnswer && "border-red-500")}
                  placeholder="Enter correct answer"
                />
                {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer.message}</p>}
              </div>

              <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                <FiPlus className="w-4 h-4" />
                Add Question
              </button>
            </form>
          </div>
        </div>

        {/* Questions List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Question Bank ({filteredQuestions.length})</h2>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter by category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input w-auto"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredQuestions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">#{index + 1}</span>
                      <span
                        className={clsx(
                          "text-xs px-2 py-1 rounded font-medium",
                          getDifficultyColor(question.difficulty),
                        )}
                      >
                        {question.difficulty}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{question.category}</span>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{question.type}</span>
                    </div>
                    <button
                      onClick={() => deleteQuestion(question.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="font-medium text-gray-900 mb-3">{question.question}</p>

                  {question.options && (
                    <ul className="text-sm text-gray-600 space-y-1 mb-3">
                      {question.options.map((option, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          {option === question.correctAnswer ? (
                            <FiCheck className="text-green-500 w-4 h-4" />
                          ) : (
                            <FiX className="text-gray-400 w-4 h-4" />
                          )}
                          <span className={option === question.correctAnswer ? "font-semibold text-green-700" : ""}>
                            {idx + 1}. {option}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {question.type === "short-answer" && (
                    <p className="text-sm">
                      <span className="font-medium text-green-700">Answer: </span>
                      {question.correctAnswer}
                    </p>
                  )}

                  <div className="text-xs text-gray-500 mt-2">Created: {question.createdAt.toLocaleDateString()}</div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FiEdit className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No questions found in this category.</p>
                  <p className="text-sm">Create your first question using the form.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionBuilderApp
