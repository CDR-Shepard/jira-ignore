import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, MessageCircle, ImageIcon, Sun, User, Monitor } from "lucide-react"
import type React from "react" // Import React

export default function PortraitGenerator() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">AI Portrait Generation</CardTitle>
          <CardDescription className="text-gray-500">Create stunning portraits with AI</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Prompt</span>
            </div>
            <Input placeholder="Picture of a women with orange background" className="w-full bg-gray-50" />
          </div>

          <div className="space-y-4">
            <FormRow icon={<ImageIcon className="w-5 h-5" />} label="Style">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Artistic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artistic">Artistic</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow icon={<ImageIcon className="w-5 h-5" />} label="Background">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Studio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="nature">Nature</SelectItem>
                  <SelectItem value="urban">Urban</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow icon={<Sun className="w-5 h-5" />} label="Lighting">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Studio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow icon={<User className="w-5 h-5" />} label="Pose">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Profile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="full-body">Full Body</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow icon={<Monitor className="w-5 h-5" />} label="Quality">
              <div className="text-right text-gray-900 pr-3">720p</div>
            </FormRow>
          </div>

          <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Portrait
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function FormRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-gray-600 w-32">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

