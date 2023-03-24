const List = require('../models/list.model');

const isListIdInDB = async (req, res, next) => {
  try {
    const foundListById = await List.findById(req.params.listId);
    if (!foundListById) {
      return res.status(404).json({ message: 'list not found' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isListIdInDB;
