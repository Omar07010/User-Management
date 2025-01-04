import User from "../models/user.js";

function checkPermission(requiredPermission) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json('Unauthorized');
        }

        const userId = req.user._id;
        try {
            const user = await User.findById(userId).populate('role');
            if (!user) {
                return res.status(404).json('User not found!');
            }

            const hasPermission = user.role.permission.includes(requiredPermission);
            if (!hasPermission) {
                return res.status(403).json('Access denied!');
            }
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json('Server error');
        }
    }
}


export default checkPermission;