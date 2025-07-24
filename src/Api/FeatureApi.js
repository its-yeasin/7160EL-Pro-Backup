const nodemailer = require('nodemailer')
const { getSmtpData } = require('../Models/Configs/ConfigSmtp')
// const adminTemplate = require('../templates/adminTemplate')
const inlineBase64 = require('nodemailer-plugin-inline-base64')
const customerTemplate = require('../templates/customerTemplate')
const adminTemplate = require('../templates/adminTemplate')

const addFeatureRequest = async (ev, data) => {
  try {
    //check if data is empty or not
    if (!data.fullName) {
      return { error: 1, message: 'Full Name is required', data: null }
    }
    if (!data.email) {
      return { error: 1, message: 'Email is required', data: null }
    }
    if (!data.title) {
      return { error: 1, message: 'Title is required', data: null }
    }
    if (!data.description) {
      return { error: 1, message: 'Description is required', data: null }
    }

    // Get SMTP Config
    const response = await getSmtpData()
    //check if there is an error
    if (response.error) {
      return { error: 1, message: 'Error on getting SMTP Config', data: null }
    }

    // Get SMTP Data
    const smtpData = response?.data?.value

    // Create Transporter
    const transporter = nodemailer.createTransport({
      host: smtpData.hostname,
      port: smtpData.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: smtpData.username,
        pass: smtpData.password,
      },
    })

    // `

    const adminHtmlTemplate = adminTemplate(data.fullName, data.email, data.title, data.description)
    const customerHtmlTemplate = customerTemplate(data.title, data.description)

    // Recipient Email
    // const mailTo = 'info@bikiran.com'
    const mailToAdmin = 'bishojit@gmail.com'

    // Mail Options
    const adminMailOptions = {
      from: `Pro Backup <${data.username}>`,
      to: mailToAdmin,
      subject: 'Feature Request',
      html: adminHtmlTemplate,
    }

    // Mail Options
    const customerMailOptions = {
      from: `Pro Backup <${data.username}>`,
      to: data.email,
      subject: 'Feature Request',
      html: customerHtmlTemplate,
    }

    // Add Inline Base64 Images plugin to compile base64 images
    transporter.use('compile', inlineBase64())

    // Send Email to Admin
    const resultAd = await transporter.sendMail(adminMailOptions)
    // Send Email to Customer
    const resultCu = await transporter.sendMail(customerMailOptions)
    console.log('resultAd', resultAd)
    console.log('resultCu', resultCu)

    // Return Success
    return {
      error: 0,
      message: 'Feature Request sent successfully',
      data: null,
    }
  } catch (err) {
    console.log(err)
    // Return Error
    return {
      error: 1,
      message: 'Error sending Feature Request',
      data: null,
    }
  }
}

module.exports = { addFeatureRequest }
