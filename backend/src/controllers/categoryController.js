import Category from '../models/Category.js'

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }
    const category = await Category.create({ name, description, icon })
    res.status(201).json({ success: true, data: category })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category already exists' })
    }
    next(error)
  }
}

export const getAllCategorys = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json({ success: true, data: categories })
  } catch (error) {
    next(error)
  }
}

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { returnDocument: 'after', runValidators: true }
    )
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }
    res.status(200).json({ success: true, data: category })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' })
    }
    next(error)
  }
}

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' })
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    next(error)
  }
}
