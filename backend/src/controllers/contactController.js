import asyncHandler from '../utils/asyncHandler.js'
import ContactMessage from '../models/ContactMessage.js'
import ApiError from '../utils/ApiError.js'
import { sendEmail } from '../utils/mailer.js'

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, message } = req.body

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required.')
  }

  const contactMsg = await ContactMessage.create({
    name,
    email,
    message,
  })

  try {
    await sendEmail({
      to: 'arturee.art@gmail.com',
      subject: `New Contact Us Message from ${name}`,
      html: `
        <div style="background-color: #e0f7fa; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #b2ebf2;">
            <!-- Header -->
            <div style="background-color: #212e53; padding: 40px 30px; text-align: center; border-bottom: 4px solid #4DD0E1;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">New Contact Message</h1>
              <p style="color: #C0E863; margin: 10px 0 0 0; font-size: 15px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">From the Website</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <div style="margin-bottom: 25px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Name</div>
                <div style="font-size: 18px; color: #212e53; font-weight: 600;">${name}</div>
              </div>
              
              <div style="margin-bottom: 30px;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Email</div>
                <a href="mailto:${email}" style="font-size: 18px; color: #00BCD4; font-weight: 600; text-decoration: none;">${email}</a>
              </div>
              
              <div style="background-color: #f0fdfa; padding: 25px; border-radius: 16px; border: 1px solid #ccfbf1;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #0f766e; font-weight: 700; margin-bottom: 12px;">Message</div>
                <div style="font-size: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap; font-style: italic;">${message}</div>
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
    data: contactMsg,
    message: 'Message sent successfully',
  })
})

export const getContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 10)
  const skip = (page - 1) * limit

  const filter = {}
  if (req.query.status) {
    filter.status = req.query.status
  }

  const [messages, total] = await Promise.all([
    ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ContactMessage.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { messageId } = req.params
  const { status } = req.body

  if (!['unread', 'read', 'replied'].includes(status)) {
    throw new ApiError(400, 'Invalid status.')
  }

  const msg = await ContactMessage.findById(messageId)
  if (!msg) throw new ApiError(404, 'Message not found.')

  msg.status = status
  await msg.save()

  res.status(200).json({
    success: true,
    data: msg,
    message: 'Status updated successfully',
  })
})

export const deleteContactMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params

  const msg = await ContactMessage.findByIdAndDelete(messageId)
  if (!msg) throw new ApiError(404, 'Message not found.')

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  })
})
