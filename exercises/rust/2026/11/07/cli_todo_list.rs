use std::env;

struct Task {
    id: i32,
    description: String,
    done: bool,
}

struct TodoList {
    tasks: Vec<Task>,
    next_id: i32,
}

impl TodoList {
    fn new() -> TodoList {
        TodoList {
            tasks: Vec::new(),
            next_id: 1,
        }
    }

    fn add(&mut self, description: String) {
        let t = Task::new(self.next_id, description);
        self.next_id += 1;
        self.tasks.push(t);
    }

    fn list(&self) {
        for task in &self.tasks {
            let status = if task.done { "✓" } else { "☐" };
            println!("{} [ {} ] {}", task.id, status, task.description);
        }
    }
}

impl Task {
    fn new(id: i32, description: String) -> Task {
        Task {
            id,
            description,
            done: false,
        }
    }
}

fn main() {
    let t = Task::new(1, "Rust 学习".to_string());
    println!("任务: {},完成状态: {}", t.description, t.done);

    let mut todo = TodoList::new();
    todo.add("Rust 学习".to_string());
    todo.add("Test Demo".to_string());
    todo.list();

    let args: Vec<String> = env::args().collect();
    println!("{:?}", args);
}
