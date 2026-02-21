// app/api/auth/forgot-password/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/app/lib/mongodb";
import User from "@/app/models/Users";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email });

    // Always respond generically — don't expose whether email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure token valid for 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // ─── Nodemailer transporter ───────────────────────────────
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ─── Beautiful HTML Email ────────────────────────────────
    const html = `
<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">

<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0"><!--[if mso]>
<xml><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:DontUseAdvancedTypographyReadingMail/></w:WordDocument>
<o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml>
<![endif]--><!--[if !mso]><!--><!--<![endif]-->
	<style>
		* {
			box-sizing: border-box;
		}

		body {
			margin: 0;
			padding: 0;
		}

		a[x-apple-data-detectors] {
			color: inherit !important;
			text-decoration: inherit !important;
		}

		#MessageViewBody a {
			color: inherit;
			text-decoration: none;
		}

		p {
			line-height: inherit
		}

		.desktop_hide,
		.desktop_hide table {
			mso-hide: all;
			display: none;
			max-height: 0px;
			overflow: hidden;
		}

		.image_block img+div {
			display: none;
		}

		sup,
		sub {
			font-size: 75%;
			line-height: 0;
		}

		.menu_block.desktop_hide .menu-links span {
			mso-hide: all;
		}

		@media (max-width:700px) {

			.desktop_hide table.icons-inner,
			.social_block.desktop_hide .social-table {
				display: inline-block !important;
			}

			.icons-inner {
				text-align: center;
			}

			.icons-inner td {
				margin: 0 auto;
			}

			.image_block div.fullWidth {
				max-width: 100% !important;
			}

			.menu-checkbox[type=checkbox]~.menu-links {
				display: none !important;
				padding: 5px 0;
			}

			.menu-checkbox[type=checkbox]:checked~.menu-trigger .menu-open {
				display: none !important;
			}

			.menu-checkbox[type=checkbox]:checked~.menu-links,
			.menu-checkbox[type=checkbox]~.menu-trigger {
				display: block !important;
				max-width: none !important;
				max-height: none !important;
				font-size: inherit !important;
			}

			.menu-checkbox[type=checkbox]~.menu-links>a,
			.menu-checkbox[type=checkbox]~.menu-links>span.label {
				display: block !important;
				text-align: center;
			}

			.menu-checkbox[type=checkbox]:checked~.menu-trigger .menu-close {
				display: block !important;
			}

			.mobile_hide {
				display: none;
			}

			.row-content {
				width: 100% !important;
			}

			.stack .column {
				width: 100%;
				display: block;
			}

			.mobile_hide {
				min-height: 0;
				max-height: 0;
				max-width: 0;
				overflow: hidden;
				font-size: 0px;
			}

			.desktop_hide,
			.desktop_hide table {
				display: table !important;
				max-height: none !important;
			}
		}

		#menu-r5c0m2:checked~.menu-links {
			background-color: #000000 !important;
		}

		#menu-r5c0m2:checked~.menu-links a,
		#menu-r5c0m2:checked~.menu-links span {
			color: #ffffff !important;
		}
	</style><!--[if mso ]><style>sup, sub { font-size: 100% !important; } sup { mso-text-raise:10% } sub { mso-text-raise:-10% }</style> <![endif]-->
</head>

<body class="body" style="background-color: #fff0e3; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
	<table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff0e3;">
		<tbody>
			<tr>
				<td>
					<table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:30px;line-height:30px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-2" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
														<tr>
															<td style="text-align:center;padding:16px 0 8px;">
																<div style="display:inline-block;background:linear-gradient(135deg,#5f2299,#9c40e0);border-radius:12px;padding:10px 22px;">
																	<span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:Arial,sans-serif;">AB Campaigns</span>
																</div>
															</td>
														</tr>
													</table>
												</td>
												<td class="column column-3" width="33.333333333333336%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-3" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #ffffff; border-radius: 24px 24px 0 0; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<table width="100%" border="0" cellpadding="20" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
														<tr>
															<td style="text-align:center;padding-top:32px;">
																<div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#5f2299,#9c40e0);border-radius:20px;line-height:72px;font-size:36px;box-shadow:0 8px 24px rgba(95,34,153,0.4);">🔑</div>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-2" style="height:35px;line-height:35px;font-size:1px;">&#8202;</div>
													<table class="heading_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="text-align:center;width:100%;">
																<h1 style="margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 27px; font-weight: normal; letter-spacing: normal; line-height: 1.2; text-align: center; margin-top: 0; margin-bottom: 0; mso-line-height-alt: 32px;"><strong>Forgot Your Password?</strong></h1>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; background-color: #ffffff; border-radius: 0 0 24px 24px; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<table class="paragraph_block block-1" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
														<tr>
															<td class="pad" style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
																<div style="color:#454545;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.8;text-align:center;mso-line-height-alt:27px;">
																	<p style="margin:0 0 8px;word-break:break-word;">Hey <strong style="color:#5f2299;">@${user.username}</strong> 👋</p>
																	<p style="margin:0;word-break:break-word;color:#666;">We received a request to reset your AB Campaigns password. Click the button below — this link expires in <strong style="color:#101010;">1 hour</strong>.<br/>If you didn't request this, you can safely ignore this email.</p>
																</div>
															</td>
														</tr>
													</table>
													<table class="button_block block-2" width="100%" border="0" cellpadding="10" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad">
																<div align="center"><a href="${resetUrl}" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#5f2299,#9c40e0);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 40px;border-radius:10px;letter-spacing:0.3px;box-shadow:0 6px 20px rgba(95,34,153,0.35);font-family:Arial,sans-serif;">🔐 &nbsp; Reset My Password</a></div>
																<p style="text-align:center;font-size:12px;color:#999;margin:12px 0 0;font-family:Arial,sans-serif;">If the button doesn't work, copy and paste this URL:<br/><a href="${resetUrl}" style="color:#5f2299;word-break:break-all;">${resetUrl}</a></p>
															</td>
														</tr>
													</table>
													<div class="spacer_block block-3" style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>
													<div class="spacer_block block-4" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-3" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-6" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="100%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:20px;line-height:20px;font-size:1px;">&#8202;</div>
													<table class="social_block block-2" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="padding-bottom:15px;padding-left:10px;padding-right:10px;padding-top:10px;text-align:center;">
																<div class="alignment" align="center">
																	<table class="social-table" width="140px" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; display: inline-block;">
																		<tr>
																			<td style="padding:0 2px 0 0;"><a href="facebook.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png" width="32" height="auto" alt="Facebook" title="facebook" style="display: block; height: auto; border: 0;"></a></td>
																			<td style="padding:0 2px 0 2px;"><a href="twitter.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png" width="32" height="auto" alt="Twitter" title="twitter" style="display: block; height: auto; border: 0;"></a></td>
																			<td style="padding:0 2px 0 2px;"><a href="linkedin.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png" width="32" height="auto" alt="Linkedin" title="linkedin" style="display: block; height: auto; border: 0;"></a></td>
																			<td style="padding:0 0 0 2px;"><a href="instagram.com" target="_blank"><img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png" width="32" height="auto" alt="Instagram" title="instagram" style="display: block; height: auto; border: 0;"></a></td>
																		</tr>
																	</table>
																</div>
															</td>
														</tr>
													</table>
													<table class="menu_block block-3" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
														<tr>
															<td class="pad" style="color:#101010;font-family:inherit;font-size:14px;text-align:center;">
																<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
																	<tr>
																		<td class="alignment" style="text-align:center;font-size:0px;"><!--[if !mso]><!--><input class="menu-checkbox" id="menu-r5c0m2" type="checkbox" style="display:none !important;max-height:0;visibility:hidden;"><!--<![endif]-->
																			<div class="menu-trigger" style="display:none;max-height:0px;max-width:0px;font-size:0px;overflow:hidden;"><label class="menu-label" for="menu-r5c0m2" style="height: 36px; width: 36px; display: inline-block; cursor: pointer; mso-hide: all; user-select: none; align: center; text-align: center; color: #ffffff; text-decoration: none; background-color: #000000; border-radius: 0;"><span class="menu-open" style="word-break: break-word; mso-hide: all; font-size: 26px; line-height: 31.5px;">☰</span><span class="menu-close" style="word-break: break-word; display: none; mso-hide: all; font-size: 26px; line-height: 36px;">✕</span></label></div>
																			<div class="menu-links"><!--[if mso]><table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style=""><tr style="text-align:center;"><![endif]--><!--[if mso]><td style="padding-top:5px;padding-right:15px;padding-bottom:5px;padding-left:15px"><![endif]--><a href="www.example.com" target="_self" style="mso-hide:false;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px;display:inline-block;color:#101010;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:undefined;text-decoration:none;letter-spacing:normal;">Unsubscribe</a><!--[if mso]></td><![endif]--><!--[if mso]><td style="padding-top:5px;padding-right:15px;padding-bottom:5px;padding-left:15px"><![endif]--><a href="www.example.com" target="_self" style="mso-hide:false;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px;display:inline-block;color:#101010;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:undefined;text-decoration:none;letter-spacing:normal;">Help</a><!--[if mso]></td><![endif]--><!--[if mso]><td style="padding-top:5px;padding-right:15px;padding-bottom:5px;padding-left:15px"><![endif]--><a href="www.example.com" target="_self" style="mso-hide:false;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px;display:inline-block;color:#101010;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:undefined;text-decoration:none;letter-spacing:normal;">Login</a><!--[if mso]></td><![endif]--><!--[if mso]><td style="padding-top:5px;padding-right:15px;padding-bottom:5px;padding-left:15px"><![endif]--><a href="www.example.com" target="_self" style="mso-hide:false;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px;display:inline-block;color:#101010;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;font-weight:undefined;text-decoration:none;letter-spacing:normal;">Privacy</a><!--[if mso]></td><![endif]--><!--[if mso]></tr></table><![endif]--></div>
																		</td>
																	</tr>
																</table>
															</td>
														</tr>
													</table>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<table class="row row-7" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
						<tbody>
							<tr>
								<td>
									<table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; color: #000000; width: 680px; margin: 0 auto;" width="680">
										<tbody>
											<tr>
												<td class="column column-1" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-2" width="66.66666666666667%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:35px;line-height:35px;font-size:1px;">&#8202;</div>
												</td>
												<td class="column column-3" width="16.666666666666668%" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top;">
													<div class="spacer_block block-1" style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
												</td>
											</tr>
										</tbody>
									</table>
								</td>
							</tr>
						</tbody>
					</table>
					<!-- AB Campaigns footer -->
					<table align="center" width="680" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;max-width:680px;margin:0 auto;">
						<tbody><tr><td style="text-align:center;padding:20px 0 30px;font-family:Arial,sans-serif;font-size:12px;color:#999;line-height:1.6;">
							<strong style="color:#5f2299;">AB Campaigns</strong> &mdash; AttireBulk Notification Manager<br/>
							This is an automated security email. Please do not reply.
						</td></tr></tbody>
					</table>
				</td>
			</tr>
		</tbody>
	</table><!-- End -->
</body>

</html>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Reset your AB Campaigns password",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("forgot-password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email.", details: error.message },
      { status: 500 }
    );
  }
}
