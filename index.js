const express = require('express');
const app = express();
const port = 3001;
const db = require('cassandra-driver');

const client = new db.Client({
    contactPoints: ['localhost'],
    localDataCenter: 'datacenter1',
    keyspace: 'test',
    authProvider: new db.auth.PlainTextAuthProvider('cassandra', 'cassandra')
});

app.use(express.json());

client.connect(function(err, result){
    console.log('cassandra connected');
});

client.execute('CREATE TABLE IF NOT EXISTS barang (id int PRIMARY KEY, nama text, harga int)', function(err, result){
    if(err) throw err;
    console.log('barang table created');
});

app.get('/', async (req, res) => {
    const query = 'SELECT * FROM barang';
    const result = await client.execute(query);
    console.log(result.rows);
    res.send(result.rows);
})

app.post('/', async (req, res) => {
    const nama = req.body.nama;
    const harga = req.body.harga;

    const idquery = 'SELECT id FROM barang';

    const idresult = await client.execute(idquery);

    const id = (idresult.rows == '') ? 1 : idresult.rows[idresult.rows.length - 1].id + 1;

    const query = `INSERT INTO barang (id, nama, harga) VALUES (${id}, '${nama}', ${harga})`;

    const result = await client.execute(query);

    res.json("Data barang berhasil ditambahkan");
})

app.put('/:id', async (req, res) => {
    const id = req.params.id;
    const nama = req.body.nama;
    const harga = req.body.harga;

    const query = `UPDATE barang SET nama = '${nama}', harga = ${harga} WHERE id = ${id}`;

    const result = await client.execute(query);

    res.json("Data barang berhasil diubah");
})

app.delete('/:id', async (req, res) => {
    const id = req.params.id;

    const query = `DELETE FROM barang WHERE id = ${id}`;

    const result = await client.execute(query);

    res.send("Data barang berhasil dihapus");
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})