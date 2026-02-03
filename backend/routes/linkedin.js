const express = require('express');
const router = express.Router();
const linkedinService = require('../services/linkedinService');

// POST /api/linkedin/schedule - Schedule a LinkedIn post
router.post('/schedule', async (req, res, next) => {
  try {
    const { text, mediaUrls, scheduledTime, visibility = 'PUBLIC' } = req.body;
    
    if (!text || !scheduledTime) {
      return res.status(400).json({
        error: 'Missing required fields: text and scheduledTime are required'
      });
    }

    const result = await linkedinService.schedulePost({
      text,
      mediaUrls,
      scheduledTime: new Date(scheduledTime),
      visibility
    });

    res.json({
      success: true,
      message: 'Post scheduled successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/linkedin/posts - Get scheduled posts
router.get('/posts', async (req, res, next) => {
  try {
    const posts = await linkedinService.getScheduledPosts();
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/linkedin/posts/:id - Delete a scheduled post
router.delete('/posts/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await linkedinService.deleteScheduledPost(id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/linkedin/oauth - Start LinkedIn OAuth flow
router.get('/oauth', (req, res) => {
  const authUrl = linkedinService.getAuthorizationUrl();
  res.redirect(authUrl);
});

// GET /api/linkedin/callback - LinkedIn OAuth callback
router.get('/callback', async (req, res, next) => {
  try {
    const { code, state, error, error_description } = req.query;
    
    if (error) {
      return res.status(400).json({
        error: 'LinkedIn OAuth failed',
        details: error_description
      });
    }

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is missing'
      });
    }

    const tokenData = await linkedinService.handleOAuthCallback(code);
    
    // Store token securely (in production, use secure session or database)
    req.session.linkedinToken = tokenData.access_token;
    req.session.linkedinExpiry = Date.now() + (tokenData.expires_in * 1000);
    
    res.json({
      success: true,
      message: 'LinkedIn authorization successful',
      data: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/linkedin/webhook - Handle LinkedIn webhook events
router.post('/webhook', express.json(), async (req, res, next) => {
  try {
    const { body } = req;
    const signature = req.headers['x-linkedin-signature'];
    
    // Verify webhook signature
    const isValid = linkedinService.verifyWebhookSignature(body, signature);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid webhook signature'
      });
    }

    // Process webhook event
    await linkedinService.processWebhookEvent(body);
    
    res.status(200).send('Webhook received');
  } catch (error) {
    next(error);
  }
});

// GET /api/linkedin/profile - Get LinkedIn profile info
router.get('/profile', async (req, res, next) => {
  try {
    const profile = await linkedinService.getProfileInfo();
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;