import React from "react";
import { Button, Popover, TextField, useTheme } from "@mui/material";
import { Formik, Form } from "formik";
import { tokens } from "src/theme";

import * as yup from "yup";

const validationSchema = yup.object().shape({
  words: yup.string().required("required"),
});

function EditSequencePopover({
  word,
  handleSubmit,
  popOpen,
  setPopOpen,
  target,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Popover
      open={popOpen}
      anchorEl={target}
      onClose={() => setPopOpen(false)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Formik
        initialValues={{
          words: word,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <Form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing(2),
            }}
          >
            <TextField
              fullWidth
              variant="filled"
              type="text"
              label="Modify Words"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.words}
              name="words"
              error={!!touched.words && !!errors.words}
              helperText={touched.words && errors.words}
            />

            <Button
              onClick={() => setPopOpen(false)}
              fullWidth
              variant="outlined"
              color="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth variant="contained" color="warning">
              Modify
            </Button>
          </Form>
        )}
      </Formik>
    </Popover>
  );
}

export default EditSequencePopover;
