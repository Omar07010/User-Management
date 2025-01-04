import express from 'express';
import Role from '../models/role.js'
const router = express.Router();

// إنشاء صلاحية جديدة
router.post('/', async (req, res) => {
    const { roleName, permission } = req.body;

    // التحقق من البيانات المدخلة
    if (!roleName || !permission) {
        return res.status(400).json({ message: 'User role and permission are required.' });
    }

    try {
        const newPermission = new Role({ roleName, permission });
        await newPermission.save();
        res.status(201).json(newPermission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating permission!' });
    }
});

// DELETE Role
router.delete('/:id',  async (req, res) => {
    const {id} = req.params
    try{
        await Role.findByIdAndDelete(id);
        res.status(200).json('Role deleted successfully!')
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error deleting role!')
    }
})

// Update User
router.put('/:id',  async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    try {
        const updatedRole = await Role.findByIdAndUpdate(id, updateData, { new: true });      
        if (!updatedRole) {
            return res.status(404).json('Role not found!');
        }

        return res.status(200).json('Updated successfully!');
        
    } catch (err) {
        console.log(err);
        return res.status(400).json('Error updating role!');
    }
});

// GET Role
router.get('/', async (req, res) => {
    try{
        const getAllRoles = await Role.find();
        res.status(200).json(getAllRoles)
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error getting roles!')
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params
    try{
        const getOneRole = await User.findById(id);
        res.status(200).json(getOneUsers)
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error getting role!')
    }
})

export default router;