http://localhost:3000/admin/users

$env:NODE_ENV="test"：切換到測試環境

echo $env:NODE_ENV ：印出目前使用的環境

npx sequelize db:seed --seed my_seeder_file.js

npx sequelize migration:generate --name add-image-to-users

console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

npx sequelize db:seed --seed 20210825070851-users-seed-file.js
npx sequelize db:seed --seed 20210830033246-categories-seed-file.js
npx sequelize db:seed --seed 20210825071142-restaurants-seed-file.js