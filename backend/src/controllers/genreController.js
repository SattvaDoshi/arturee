import Genre from '../models/Genre.js'

export const createGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }
    const genre = await Genre.create({ name, description })
    res.status(201).json({ success: true, data: genre })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Genre already exists' })
    }
    next(error)
  }
}

export const getAllGenres = async (req, res, next) => {
  try {
    const genres = await Genre.find().sort({ name: 1 })
    res.status(200).json({ success: true, data: genres })
  } catch (error) {
    next(error)
  }
}

export const updateGenre = async (req, res, next) => {
  try {
    const { name, description } = req.body
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    )
    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' })
    }
    res.status(200).json({ success: true, data: genre })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Genre with this name already exists' })
    }
    next(error)
  }
}

export const deleteGenre = async (req, res, next) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id)
    if (!genre) {
      return res.status(404).json({ success: false, message: 'Genre not found' })
    }
    res.status(200).json({ success: true, message: 'Genre deleted successfully' })
  } catch (error) {
    next(error)
  }
}
