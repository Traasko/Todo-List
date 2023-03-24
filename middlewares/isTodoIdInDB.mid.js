const Todo = require('../models/todo.model');

const isTodoIdInDB = async (req, res, next) => {
  try {
    const foundTodoById = await Todo.findById(req.params.todoId);
    if (!foundTodoById) {
      return res.status(404).json({ message: 'Todo not found' });
    }
    req.params.listId = foundTodoById.listId;
    req.todo = foundTodoById;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isTodoIdInDB;
