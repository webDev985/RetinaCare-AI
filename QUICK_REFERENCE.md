# 🚀 DR Detection - Quick Reference

## Live URLs

### Frontend

- **Production**: https://frontend-dwse8jws9-webdev985s-projects.vercel.app
- **Alias**: https://frontend-three-lime-58.vercel.app

### Backend API

- **Production**: https://backend-6cly9nqdo-webdev985s-projects.vercel.app
- **Alias**: https://backend-alpha-red-34.vercel.app

### ML Service

- ⏳ **READY TO DEPLOY** - Choose from DEPLOYMENT_COMPLETE.md

---

## Quick Test Commands

```bash
# Test Frontend
open https://frontend-dwse8jws9-webdev985s-projects.vercel.app

# Test Backend API
curl https://backend-alpha-red-34.vercel.app

# Test Backend Health
curl https://backend-alpha-red-34.vercel.app/api/auth/status
```

---

## Environment Variables Required

### Backend (Set in Vercel Dashboard)

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - Set to "production"

---

## Next Steps

1. Set Backend environment variables in Vercel dashboard
2. Deploy ML Service (see DEPLOYMENT_COMPLETE.md)
3. Update frontend with ML service URL
4. Test full stack

---

**Status**: ✅ Frontend Live | ✅ Backend Live | ⏳ ML Service Ready
**Platform**: Vercel + Railway/HuggingFace/Render (for ML)
