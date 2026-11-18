
import { useMemo, useState } from "react";
import {
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  FileText,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Users,
  CalendarDays,
  CircleAlert,
  Megaphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";

type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
};

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Follow up with Abdul Rahim",
    description: "Check the visa application progress.",
    dueDate: "Nov 11, 2026",
    priority: "High",
    status: "Pending",
    assignedTo: "Admin",
  },
  {
    id: 2,
    title: "Review medical documents",
    description: "Verify medical reports for new candidates.",
    dueDate: "Nov 12, 2026",
    priority: "Medium",
    status: "In Progress",
    assignedTo: "Manager",
  },
  {
    id: 3,
    title: "Update candidate records",
    description: "Complete missing candidate information.",
    dueDate: "Nov 13, 2026",
    priority: "Low",
    status: "Completed",
    assignedTo: "Staff",
  },
  {
    id: 4,
    title: "Prepare monthly report",
    description: "Prepare the monthly business summary.",
    dueDate: "Nov 15, 2026",
    priority: "High",
    status: "Pending",
    assignedTo: "Admin",
  },
];

const initialNotes: Note[] = [
  {
    id: 1,
    title: "November Recruitment Plan",
    content:
      "Review all active candidates and prioritize pending visa applications. Coordinate with the processing team.",
    author: "Admin",
    date: "Nov 09, 2026",
  },
  {
    id: 2,
    title: "Team Meeting",
    content:
      "Discuss candidate processing delays and improve document verification workflow.",
    author: "Manager",
    date: "Nov 08, 2026",
  },
  {
    id: 3,
    title: "Important Reminder",
    content:
      "Check passport expiry dates before starting the next processing stage.",
    author: "Admin",
    date: "Nov 07, 2026",
  },
];

const activities = [
  {
    id: 1,
    title: "New candidate registered",
    description: "Abdul Rahim was added to the candidate list.",
    user: "Admin",
    time: "10 minutes ago",
    type: "candidate",
  },
  {
    id: 2,
    title: "Visa document uploaded",
    description: "Visa_Document.pdf was uploaded for Abdul Rahim.",
    user: "Manager",
    time: "45 minutes ago",
    type: "file",
  },
  {
    id: 3,
    title: "Task completed",
    description: "Update candidate records was marked completed.",
    user: "Staff",
    time: "2 hours ago",
    type: "task",
  },
  {
    id: 4,
    title: "New lead created",
    description: "A new lead was added to the system.",
    user: "Admin",
    time: "Yesterday",
    type: "lead",
  },
  {
    id: 5,
    title: "Internal note created",
    description: "November Recruitment Plan was created.",
    user: "Admin",
    time: "Yesterday",
    type: "note",
  },
];

const announcements = [
  {
    id: 1,
    title: "Monthly Team Meeting",
    description:
      "The monthly team meeting will be held on November 15. All team members should attend.",
    date: "Nov 10, 2026",
    author: "Admin",
    important: true,
  },
  {
    id: 2,
    title: "Document Verification Update",
    description:
      "Please ensure all candidate documents are verified before moving to the next processing stage.",
    date: "Nov 08, 2026",
    author: "Manager",
    important: false,
  },
];

const priorityStyles: Record<TaskPriority, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
};

const statusStyles: Record<TaskStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function OthersPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [notes, setNotes] = useState(initialNotes);

  const [search, setSearch] = useState("");
  const [taskFilter, setTaskFilter] = useState("all");

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium" as TaskPriority,
    assignedTo: "Admin",
  });

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });

  const taskStats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        taskFilter === "all" || task.status === taskFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, taskFilter]);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) =>
      `${note.title} ${note.content} ${note.author}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [notes, search]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    setTasks((prev) => [
      {
        id: Date.now(),
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate || "No due date",
        priority: newTask.priority,
        status: "Pending",
        assignedTo: newTask.assignedTo,
      },
      ...prev,
    ]);

    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      priority: "Medium",
      assignedTo: "Admin",
    });

    setTaskDialogOpen(false);
  };

  const addNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    setNotes((prev) => [
      {
        id: Date.now(),
        title: newNote.title,
        content: newNote.content,
        author: "Admin",
        date: "Nov 10, 2026",
      },
      ...prev,
    ]);

    setNewNote({ title: "", content: "" });
    setNoteDialogOpen(false);
  };

  const updateTaskStatus = (id: number, completed: boolean) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, status: completed ? "Completed" : "Pending" }
          : task
      )
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const deleteNote = (id: number) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
  }: {
    title: string;
    value: number;
    description: string;
    icon: typeof ListTodo;
  }) => (
    <Card className="shadow-none">
      <CardContent className="flex items-center justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3">
          <Icon className="size-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              Others
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage team activities, tasks, notes and announcements.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setNoteDialogOpen(true)}>
            <StickyNote className="mr-2 size-4" />
            New Note
          </Button>
          <Button onClick={() => setTaskDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={taskStats.total}
          description="All assigned tasks"
          icon={ListTodo}
        />
        <StatCard
          title="Pending"
          value={taskStats.pending}
          description="Tasks waiting to start"
          icon={Clock}
        />
        <StatCard
          title="In Progress"
          value={taskStats.inProgress}
          description="Currently being handled"
          icon={Activity}
        />
        <StatCard
          title="Completed"
          value={taskStats.completed}
          description="Successfully completed"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Content */}
      <Card className="shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Workspace</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Your team's daily operations and internal communication.
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks and notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="tasks" className="space-y-5">
            <TabsList className="h-auto flex-wrap">
              <TabsTrigger value="tasks" className="gap-2">
                <ListTodo className="size-4" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="size-4" />
                Activity Log
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="size-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="announcements" className="gap-2">
                <Megaphone className="size-4" />
                Announcements
              </TabsTrigger>
            </TabsList>

            {/* Tasks */}
            <TabsContent value="tasks" className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-medium">Task Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage your team's work.
                  </p>
                </div>

                <Select value={taskFilter} onValueChange={setTaskFilter}>
                  <SelectTrigger className="w-full sm:w-[170px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center"
                  >
                    <Checkbox
                      checked={task.status === "Completed"}
                      onCheckedChange={(checked) =>
                        updateTaskStatus(task.id, checked === true)
                      }
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <p
                        className={`font-medium ${
                          task.status === "Completed"
                            ? "text-muted-foreground line-through"
                            : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="size-3.5" />
                          {task.dueDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3.5" />
                          {task.assignedTo}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={priorityStyles[task.priority]}
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={statusStyles[task.status]}
                      >
                        {task.status}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                task.status !== "Completed"
                              )
                            }
                          >
                            <CheckCircle2 className="mr-2 size-4" />
                            {task.status === "Completed"
                              ? "Mark as pending"
                              : "Mark as completed"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {filteredTasks.length === 0 && (
                  <div className="py-12 text-center">
                    <ListTodo className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="font-medium">No tasks found</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Try another search or filter.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Activity Log */}
            <TabsContent value="activity" className="space-y-4">
              <div>
                <h3 className="font-medium">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">
                  Recent actions performed in the workspace.
                </p>
              </div>

              <div className="space-y-1">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 rounded-lg p-3 hover:bg-muted/30"
                  >
                    <div className="mt-0.5 rounded-lg border bg-muted/40 p-2">
                      {activity.type === "candidate" && (
                        <Users className="size-4 text-muted-foreground" />
                      )}
                      {activity.type === "file" && (
                        <FileText className="size-4 text-muted-foreground" />
                      )}
                      {activity.type === "task" && (
                        <CheckCircle2 className="size-4 text-muted-foreground" />
                      )}
                      {activity.type === "lead" && (
                        <Users className="size-4 text-muted-foreground" />
                      )}
                      {activity.type === "note" && (
                        <StickyNote className="size-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {activity.user} · {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Notes */}
            <TabsContent value="notes" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Internal Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Important information for your team.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setNoteDialogOpen(true)}
                >
                  <Plus className="mr-2 size-4" />
                  Add Note
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="shadow-none">
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="rounded-md border bg-muted/40 p-2">
                            <StickyNote className="size-4 text-muted-foreground" />
                          </div>
                          <h4 className="truncate font-medium">
                            {note.title}
                          </h4>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 shrink-0"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="mr-2 size-4" />
                              Delete note
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <p className="min-h-12 text-sm leading-relaxed text-muted-foreground">
                        {note.content}
                      </p>

                      <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                        <span>{note.author}</span>
                        <span>{note.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredNotes.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <StickyNote className="mx-auto mb-3 size-8 text-muted-foreground" />
                    <p className="font-medium">No notes found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Announcements */}
            <TabsContent value="announcements" className="space-y-4">
              <div>
                <h3 className="font-medium">Team Announcements</h3>
                <p className="text-sm text-muted-foreground">
                  Important updates and messages for your team.
                </p>
              </div>

              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg border bg-muted/40 p-2">
                        {announcement.important ? (
                          <CircleAlert className="size-5 text-muted-foreground" />
                        ) : (
                          <Bell className="size-5 text-muted-foreground" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-medium">
                            {announcement.title}
                          </h4>
                          {announcement.important && (
                            <Badge variant="destructive">Important</Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {announcement.description}
                        </p>
                        <p className="mt-3 text-xs text-muted-foreground">
                          {announcement.author} · {announcement.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>
              Assign a new task to your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                placeholder="Enter task title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Add task details..."
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask((prev) => ({
                      ...prev,
                      priority: value as TaskPriority,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assign To</label>
              <Select
                value={newTask.assignedTo}
                onValueChange={(value) =>
                  setNewTask((prev) => ({
                    ...prev,
                    assignedTo: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTaskDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={addTask} disabled={!newTask.title.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Internal Note</DialogTitle>
            <DialogDescription>
              Save an important note for your team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note Title</label>
              <Input
                placeholder="Enter note title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Note Content</label>
              <Textarea
                placeholder="Write your note..."
                rows={5}
                value={newNote.content}
                onChange={(e) =>
                  setNewNote((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={addNote}
              disabled={!newNote.title.trim() || !newNote.content.trim()}
            >
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
