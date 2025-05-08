import { Box, Button, Checkbox, FormLabel, TextField, Typography } from '@mui/material'
import React, { useState } from 'react'
import { addMovie } from '../../api-helpers/api-helpers'
const labelProps = {
    mt: 1,
    mb: 1
}
const AddMovie = () => {
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        posterUrl: "",
        releaseDate: "",
        featured: false
    })
    const [actors, setActors] = useState([]);
    const [actor, setActor] = useState("");
    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputs.title.trim() || !inputs.description.trim() || !inputs.posterUrl.trim()) {
            console.error("Missing required fields");
            return;
        }
        if (actors.length === 0 || actors.some(actor => !actor.trim())) {
            console.error("Actors list is invalid");
            return;
        }

        console.log(inputs, actors);
        addMovie({ ...inputs, actors })
            .then((res) => console.log(res))
            .catch((err) => console.log(err));
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box
                    width={"50%"}
                    padding={10}
                    margin={"auto"}
                    display={"flex"}
                    flexDirection={"column"}
                    boxShadow={"10px 10px 20px #ccc"}>
                    <Typography textAlign={"center"} variant={"h5"} fontFamily={"verdana"} >
                        Add New Movie
                    </Typography>
                    <FormLabel sx={{ labelProps }}>Title</FormLabel>
                    <TextField value={inputs.title} onChange={handleChange} name="title" variant="standard" margin="normal"></TextField>
                    <FormLabel sx={{ labelProps }}>Description</FormLabel>
                    <TextField value={inputs.description} onChange={handleChange} name="description" variant="standard" margin="normal"></TextField>
                    <FormLabel sx={{ labelProps }}>Poster URL</FormLabel>
                    <TextField value={inputs.posterUrl} onChange={handleChange} name="posterUrl" variant="standard" margin="normal"></TextField>
                    <FormLabel sx={{ labelProps }}>ReleaseDate</FormLabel>
                    <TextField type="date" value={inputs.releaseDate} onChange={handleChange} name="releaseDate" variant="standard" margin="normal"></TextField>
                    <FormLabel sx={{ labelProps }}>Actors</FormLabel>
                    <Box>
                        <TextField
                            value={actor}
                            onChange={(e) => setActor(e.target.value)}
                            name="actors"
                            variant="standard"
                            margin="normal" />
                        <Button onClick={() => {
                            setActors([...actors, actor]);
                            setActor("")
                        }}>Add</Button>
                    </Box>

                    <FormLabel sx={{ labelProps }}>
                        Featured
                    </FormLabel>
                    <Checkbox
                        name="featured"
                        checked={inputs.featured}
                        onClick={(e) => setInputs((prevState) => ({ ...prevState, featured: e.target.checked }))}
                        sx={{ mr: "auto" }} />
                    <Button type="submit" variant="contained" sx={{
                        margin: "auto", 
                        borderRadius: 4, 
                        fontSize: 20, 
                        width: "30%",
                        bgcolor: "#2d2b42", 
                        ":hover": {
                            backgroundColor: "#121217"
                        },
                    }}>
                        Add Movie
                    </Button>


                </Box>
            </form>
        </div>
    )
}

export default AddMovie