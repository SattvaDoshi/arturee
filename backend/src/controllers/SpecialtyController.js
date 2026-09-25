import Specialty from '../models/Specialty.js'

export const createSpecialty = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' })
    }
    const specialty = await Specialty.create({ name, description, icon })
    res.status(201).json({ success: true, data: specialty })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Specialty already exists' })
    }
    next(error)
  }
}

export const getAllSpecialties = async (req, res, next) => {
  try {
    const specialties = await Specialty.find().sort({ name: 1 })
    res.status(200).json({ success: true, data: specialties })
  } catch (error) {
    next(error)
  }
}

export const updateSpecialty = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body
    const specialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      { name, description, icon },
      { returnDocument: 'after', runValidators: true }
    )
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found' })
    }
    res.status(200).json({ success: true, data: specialty })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Specialty with this name already exists' })
    }
    next(error)
  }
}

export const deleteSpecialty = async (req, res, next) => {
  try {
    const specialty = await Specialty.findByIdAndDelete(req.params.id)
    if (!specialty) {
      return res.status(404).json({ success: false, message: 'Specialty not found' })
    }
    res.status(200).json({ success: true, message: 'Specialty deleted successfully' })
  } catch (error) {
    next(error)
  }
}
