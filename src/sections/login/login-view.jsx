// src/sections/login/LoginView.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
// eslint-disable-next-line no-unused-vars

import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
// eslint-disable-next-line perfectionist/sort-imports
import Alert from '@mui/material/Alert';

import { setToken, getToken } from 'src/utils/auth';
// eslint-disable-next-line perfectionist/sort-imports
import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';
// eslint-disable-next-line perfectionist/sort-imports
import { bgGradient } from 'src/theme/css';

export default function LoginView() {
  const theme = useTheme();
  const navigate = useNavigate();

  // redirect if already logged in
 useEffect(() => {
  if (getToken()) {
    navigate('/', { replace: true });
  }
}, [navigate]);


  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(""); // Prefilled for testing
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await fetch("https://backend.minutos.shop/api/admin/adminLogin", {   // HARD-CODED URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Login failed.");
        setLoading(false);
        return;
      }

      // Save token
      setToken(data.token);

      navigate("/", { replace: true });
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: "/assets/background/overlay_4.jpg",
        }),
        height: 1,
      }}
    >
      <Logo sx={{ position: "fixed", top: 24, left: 24 }} />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card sx={{ p: 5, width: 1, maxWidth: 420 }}>
          <Typography variant="h4">Admin Login</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Don’t have an account?
            <Link variant="subtitle2" sx={{ ml: 0.5 }}>
              Contact Admin
            </Link>
          </Typography>

          <Divider sx={{ my: 3 }} />

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        <Iconify icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>

            {error && (
              <Alert sx={{ mt: 2 }} severity="error">
                {error}
              </Alert>
            )}

            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="inherit"
              loading={loading}
              sx={{ mt: 3 }}
            >
              Login
            </LoadingButton>
          </form>
        </Card>
      </Stack>
    </Box>
  );
}
