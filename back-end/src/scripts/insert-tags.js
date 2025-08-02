const sequelize = require('../config/database');
const Tag = require('../models/tag.model');

const sampleTags = [
    { name: 'chu kỳ của bạn', slug: 'chu-ky-cua-ban' },
    { name: 'sức khỏe 360', slug: 'suc-khoe-360' },
    { name: 'đang mang thai', slug: 'dang-mang-thai' },
    { name: 'mang thai', slug: 'mang-thai' },
    { name: 'làm mẹ', slug: 'lam-me' }
];

async function insertTags() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync table nếu chưa có
        await Tag.sync({ force: false });

        // Insert tags nếu chưa có
        for (const tagData of sampleTags) {
            const [tag, created] = await Tag.findOrCreate({
                where: { slug: tagData.slug },
                defaults: tagData
            });
            
            if (created) {
                console.log(`✅ Created tag: ${tag.name}`);
            } else {
                console.log(`⚠️  Tag already exists: ${tag.name}`);
            }
        }

        console.log('✅ Tags insertion completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

insertTags();
