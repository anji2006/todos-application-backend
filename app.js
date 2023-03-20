const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const cors = require("cors");

const format = require("date-fns/format/");
const isValid = require("date-fns/isValid");

const dbPath = path.join(__dirname, "todoApplication.db");
const app = express();
let db = null;

app.use(cors());
app.use(express.json());

const InstilizationDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(2006, () => {
      console.log("Server start sharing date through port: 2006!!");
    });
  } catch (e) {
    console.log(`Database Error:${e.message}`);
  }
};
InstilizationDbAndServer();

const StatusArray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryArray = ["WORK", "HOME", "LEARNING"];
const priorityArray = ["HIGH", "MEDIUM", "LOW"];
const camelCase = (arr) => {
  const updateArr = arr.map((each) => {
    return {
      id: each.id,
      todo: each.todo,
      priority: each.priority,
      status: each.status,
      category: each.category,
      dueDate: each.due_date,
    };
  });
  return updateArr;
};

const statusValidation = (request, response, next) => {
  const { status } = request.query;
  if (StatusArray.includes(status) || status === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
const priorityValidation = (request, response, next) => {
  const { priority } = request.query;
  if (priorityArray.includes(priority) || priority === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};
const categoryValidation = (request, response, next) => {
  const { category } = request.query;
  if (categoryArray.includes(category) || category === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};
const dateValidation = (request, response, next) => {
  const { date } = request.query;
  const searchDate = new Date(date);
  if (isValid(searchDate)) {
    const updateDate = format(
      new Date(
        searchDate.getFullYear(),
        searchDate.getMonth(),
        searchDate.getDate()
      ),
      "yyyy-MM-dd"
    );
    request.query.date = updateDate;
    next();
  } else if (date === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

// conditions in body
const statusValidation1 = (request, response, next) => {
  const { status } = request.body;
  if (StatusArray.includes(status) || status === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Status");
  }
};
const priorityValidation1 = (request, response, next) => {
  const { priority } = request.body;
  if (priorityArray.includes(priority) || priority === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
};
const categoryValidation1 = (request, response, next) => {
  const { category } = request.body;
  if (categoryArray.includes(category) || category === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Todo Category");
  }
};
const dateValidation1 = (request, response, next) => {
  const { dueDate } = request.body;
  const searchDate = new Date(dueDate);
  if (isValid(searchDate)) {
    const updateDate = format(
      new Date(
        searchDate.getFullYear(),
        searchDate.getMonth(),
        searchDate.getDate()
      ),
      "yyyy-MM-dd"
    );
    request.body.dueDate = updateDate;
    next();
  } else if (dueDate === undefined) {
    next();
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
};

// get all todo s
app.get(
  "/todos/",
  statusValidation,
  priorityValidation,
  categoryValidation,
  dateValidation,
  async (request, response) => {
    const { status, priority, search_q = "", category } = request.query;
    if (status != undefined && priority !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE status = '${status}' and priority = '${priority}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else if (status !== undefined && category !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE status = '${status}' and category = '${category}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else if (priority !== undefined && category !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}' and category = '${category}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else if (category !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE category = '${category}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else if (status !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE status = '${status}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else if (priority !== undefined) {
      const allTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}'`;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    } else {
      const allTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' `;
      const todoData = await db.all(allTodosQuery);
      response.send(camelCase(todoData));
    }
  }
);

// get specific todo
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id = ${todoId}`;
  const getDetails = await db.get(getTodoQuery);
  const updateDetails = {
    id: getDetails.id,
    todo: getDetails.todo,
    priority: getDetails.priority,
    status: getDetails.status,
    category: getDetails.category,
    dueDate: getDetails.due_date,
  };
  response.send(updateDetails);
});

// get todo with due Date
app.get("/agenda/", dateValidation, async (request, response) => {
  const { date } = request.query;
  console.log(date);
  const getQueryOnDate = `SELECT * FROM todo WHERE due_date = '${date}'`;
  const getDetails = await db.all(getQueryOnDate);
  response.send(camelCase(getDetails));
});

// create Todo
app.post(
  "/todos/",
  statusValidation1,
  priorityValidation1,
  categoryValidation1,
  dateValidation1,
  async (request, response) => {
    const { id, todo, category, priority, status, dueDate } = request.body;
    const createTodoQuery = `
    INSERT INTO
        todo(id,todo,category,priority,status,due_date)
    VALUES
        (${id},'${todo}','${category}','${priority}','${status}','${dueDate}')`;
    await db.run(createTodoQuery);
    response.send("Todo Successfully Added");
  }
);

// update todo
app.put(
  "/todos/:todoId/",
  statusValidation1,
  priorityValidation1,
  categoryValidation1,
  dateValidation1,
  async (request, response) => {
    const { status, priority, todo, category, dueDate } = request.body;
    const { todoId } = request.params;
    if (status !== undefined) {
      const updateQuery = `
        UPDATE
            todo
        SET
            status = '${status}'
        WHERE
            id = ${todoId}`;
      await db.run(updateQuery);
      response.send("Status Updated");
    } else if (priority !== undefined) {
      const updateQuery = `
        UPDATE
            todo
        SET
            priority = '${priority}'
        WHERE
            id = ${todoId}`;
      await db.run(updateQuery);
      response.send("Priority Updated");
    } else if (todo !== undefined) {
      const updateQuery = `
        UPDATE
            todo
        SET
            todo = '${todo}'
        WHERE
            id = ${todoId}`;
      await db.run(updateQuery);
      response.send("Todo Updated");
    } else if (category !== undefined) {
      const updateQuery = `
        UPDATE
            todo
        SET
            category = '${category}'
        WHERE
            id = ${todoId}`;
      await db.run(updateQuery);
      response.send("Category Updated");
    } else if (dueDate !== undefined) {
      const updateQuery = `
        UPDATE
            todo
        SET
            due_date = '${dueDate}'
        WHERE
            id = ${todoId}`;
      await db.run(updateQuery);
      response.send("Due Date Updated");
    }
  }
);

// delete todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
