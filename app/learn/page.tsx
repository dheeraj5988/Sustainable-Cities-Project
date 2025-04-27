"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { educationTopics, type EducationTopic } from "@/lib/data"
import { Check, ChevronRight, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState<EducationTopic | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Education Hub</h1>
        <p className="text-muted-foreground">Learn about sustainability practices and how you can make a difference</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {educationTopics.map((topic) => (
          <Card
            key={topic.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedTopic(topic)}
          >
            <CardHeader className="pb-2">
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 line-clamp-3">{topic.description}</p>
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                Learn More <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedTopic && <TopicDialog topic={selectedTopic} onClose={() => setSelectedTopic(null)} />}
    </div>
  )
}

function TopicDialog({
  topic,
  onClose,
}: {
  topic: EducationTopic
  onClose: () => void
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{topic.title}</DialogTitle>
          <DialogDescription>{topic.description}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-3">Key Tips</h3>
            <ul className="space-y-2">
              {topic.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-lg">Resources</h3>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF Guide
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Official Website
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <p className="text-muted-foreground">Video Content</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Educational video about {topic.title.toLowerCase()}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Did You Know?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {topic.title === "Waste Reduction" &&
                    "India generates approximately 62 million tonnes of waste each year, with only about 20% being processed properly."}
                  {topic.title === "Energy Conservation" &&
                    "Switching to LED bulbs can reduce energy consumption by up to 80% compared to traditional incandescent bulbs."}
                  {topic.title === "Green Spaces" &&
                    "Urban areas with 20% more green space report 30% lower stress levels among residents."}
                  {topic.title === "Rainwater Harvesting" &&
                    "A simple rainwater harvesting system can collect up to 80% of rainfall from your roof."}
                  {topic.title === "Pollution Control" &&
                    "Air pollution causes approximately 1.7 million premature deaths in India annually."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Community Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">Join local initiatives to make a bigger impact:</p>
                <ul className="text-sm space-y-1">
                  <li>• Community clean-up drives</li>
                  <li>• Awareness workshops</li>
                  <li>• Tree plantation events</li>
                  <li>• Sustainability challenges</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
