use std::{env, fs};

struct Task {
    id: i32,
    description: String,
    done: bool,
}
enum Command {
    Add(String),
    List,
    Delete(i32),
    Done(i32),
}

struct TodoList {
    tasks: Vec<Task>,
    next_id: i32,
}

impl Command {
    fn parse(args: &[String]) -> Result<Command, String> {
        if args.len() < 2 {
            return Err(format!(
                "Usage: {} <add | list | done | delete> [args]",
                args[0]
            ));
        }
        match args[1].as_str() {
            "add" => {
                if args.len() < 3 {
                    return Err(format!("Usage: {} add <Task Description>", &args[0]));
                }
                Ok(Command::Add(args[2].clone()))
            }
            "list" => Ok(Command::List),
            "done" => {
                if args.len() < 3 {
                    return Err(format!("Usage: {} done <id>", args[0]));
                }
                let id: i32 = args[2].parse().map_err(|_| "id must number".to_string())?;
                Ok(Command::Done(id))
            }
            "delete" => {
                if args.len() < 3 {
                    return Err(format!("Usage: {} delete <id>", args[0]));
                }
                let id: i32 = args[2].parse().map_err(|_| "id must number".to_string())?;
                Ok(Command::Delete(id))
            }
            _ => Err(format!("Unknown Command:{}", args[1])),
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
    fn load(id: i32, done: bool, description: String) -> Task {
        Task {
            id,
            description,
            done: done,
        }
    }
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
    fn save(&self) -> Result<(), String> {
        let mut content = String::new();
        for task in &self.tasks {
            let done = if task.done { "1" } else { "0" };
            content.push_str(&format!("{}|{}|{}\n", task.id, done, task.description));
        }
        fs::write("task.txt", content).map_err(|e| format!("Save Error: {}", e))?;
        Ok(())
    }

    fn load() -> Result<TodoList, String> {
        let mut list = TodoList::new();
        let content = match fs::read_to_string("task.txt") {
            Ok(c) => c,
            Err(_) => return Ok(list),
        };
        for line in content.lines() {
            let parts: Vec<&str> = line.split('|').collect();
            if parts.len() != 3 {
                continue;
            }
            let id: i32 = parts[0].parse().map_err(|e| format!("Parse Err: {}", e))?;
            let done = parts[1] == "1";
            let description: String = parts[2].to_string();

            let task = Task::load(id, done, description);
            list.tasks.push(task);
            if id >= list.next_id {
                list.next_id = id + 1;
            }
        }
        Ok(list)
    }
    fn done(&mut self, id: i32) {
        for task in &mut self.tasks {
            if task.id == id {
                task.done = true;
                break;
            }
        }
    }
    fn delete(&mut self, id: i32) {
        self.tasks.retain(|task| task.id != id);
    }
}

fn run(todo: &mut TodoList, cmd: Command) -> Result<(), String> {
    match cmd {
        Command::Add(desc) => {
            todo.add(desc);
            todo.save()?;
            println!("Success");
            todo.list();
        }
        Command::List => {
            todo.list();
        }
        Command::Done(id) => {
            todo.done(id);
            todo.save()?;
            println!("Task {} Finished!", id);
            todo.list();
        }
        Command::Delete(id) => {
            todo.delete(id);
            todo.save()?;
            println!("Task {} Deleted!", id);
            todo.list();
        }
    }
    Ok(())
}

fn main() {
    let args: Vec<String> = env::args().collect();
    let mut todo = match TodoList::load() {
        Ok(list) => list,
        Err(e) => {
            eprintln!("加载失败: {}", e);
            std::process::exit(1);
        }
    };
    let cmd = match Command::parse(&args) {
        Ok(cmd) => cmd,
        Err(e) => {
            eprintln!("{}", e);
            std::process::exit(1);
        }
    };
    if let Err(e) = run(&mut todo, cmd) {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }
}
