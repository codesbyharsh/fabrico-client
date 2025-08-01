router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create session
  const sessionId = crypto.randomBytes(16).toString('hex');
  user.sessionId = sessionId;
  await user.save();

  res.json({ 
    user: { name: user.name, email: user.email, role: user.role },
    sessionId 
  });
});