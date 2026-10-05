import asyncHandler from '../utils/asyncHandler.js'
import ArtistApplication from '../models/ArtistApplication.js'
import ApiError from '../utils/ApiError.js'

import { sendEmail } from '../utils/mailer.js'

// ── Public: Submit Application ──────────────────────────────────────────────

export const submitApplication = asyncHandler(async (req, res) => {
  const { name, phone, whatsapp, email, videoLink, specialty, specialties } = req.body

  if (!name || !phone || !whatsapp || !email || !videoLink) {
    throw new ApiError(400, 'All fields are required.')
  }

  const application = await ArtistApplication.create({
    name,
    phone,
    whatsapp,
    email,
    videoLink,
    specialty,
    specialties: specialties || (specialty ? [specialty] : []),
  })

  try {
    await sendEmail({
      to: 'arturee.art@gmail.com',
      subject: `New Artist Application from ${name}`,
      html: `
        <div style="background-color: #e0f7fa; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #b2ebf2;">
            <!-- Header -->
            <div style="background-color: #212e53; padding: 40px 30px; text-align: center; border-bottom: 4px solid #4DD0E1;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">New Artist Application</h1>
              <p style="color: #C0E863; margin: 10px 0 0 0; font-size: 15px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Review the application</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <div style="margin-bottom: 25px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Name</div>
                <div style="font-size: 18px; color: #212e53; font-weight: 600;">${name}</div>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Email</div>
                <a href="mailto:${email}" style="font-size: 18px; color: #00BCD4; font-weight: 600; text-decoration: none;">${email}</a>
              </div>
              
              <div style="margin-bottom: 25px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Phone</div>
                <div style="font-size: 18px; color: #212e53; font-weight: 600;">${phone}</div>
              </div>
              
              <div style="margin-bottom: 35px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">WhatsApp</div>
                <div style="font-size: 18px; color: #212e53; font-weight: 600;">${whatsapp}</div>
              </div>
              
              <div style="text-align: center; margin-top: 10px;">
                <a href="${videoLink}" target="_blank" style="background-color: #4DD0E1; color: #212e53; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; display: inline-block; border-bottom: 4px solid #00BCD4;">Review Application Drive</a>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 500;">&copy; ${new Date().getFullYear()} arturee. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    })
  } catch (emailErr) {
    console.error('Failed to send email:', emailErr)
  }

  res.status(201).json({
    success: true,
    data: application,
    message: 'Application submitted successfully',
  })
})

// ── Admin: List Applications ────────────────────────────────────────────────

export const getApplications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.status) {
    filter.status = req.query.status
  }

  const [applications, total] = await Promise.all([
    ArtistApplication.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ArtistApplication.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

// ── Admin: Update Application Status ────────────────────────────────────────

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params
  const { status } = req.body

  if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
    throw new ApiError(400, 'Invalid status.')
  }

  const application = await ArtistApplication.findById(applicationId)
  if (!application) throw new ApiError(404, 'Application not found.')

  application.status = status
  await application.save()

  res.status(200).json({
    success: true,
    data: application,
    message: 'Status updated successfully',
  })
})

// ── Admin: Delete Application ───────────────────────────────────────────────

export const deleteApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params

  const application = await ArtistApplication.findByIdAndDelete(applicationId)
  if (!application) throw new ApiError(404, 'Application not found.')

  res.status(200).json({
    success: true,
    message: 'Application deleted successfully',
  })
})
