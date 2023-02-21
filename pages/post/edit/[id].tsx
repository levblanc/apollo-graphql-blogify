import Error from '@/components/Error';
import dateFormatter from '@/utils/dateFormatter';
import { useMutation, useQuery } from '@apollo/client';
import {
  Button,
  Container,
  Divider,
  Group,
  Text,
  Loader,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GET_POST, POST_UPDATE } from '../gql';

export default function ViewPost() {
  const router = useRouter();
  const { id } = router.query;
  const { data, loading, error } = useQuery(GET_POST, {
    variables: {
      postId: Number(id),
    },
  });
  const [
    postUpdate,
    { data: updateData, loading: updateLoading, error: updateError },
  ] = useMutation(POST_UPDATE);

  const post = data?.getPost?.post;

  const form = useForm({
    initialValues: {
      title: '',
      content: '',
    },
    validate: {
      title: (value) => (value ? null : 'Title is required'),
      content: (value) => (value ? null : 'Content is required'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    await postUpdate({
      variables: {
        postId: Number(id),
        post: values,
      },
    });

    router.back();
  };

  useEffect(() => {
    if (data) {
      form.setValues({
        title: post.title,
        content: post.content,
      });
    }
  }, [data]);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Container>
        {updateError && <Error message={updateError.message} />}

        {updateData?.postUpdate?.error && (
          <Error
            code={
              updateData.postUpdate.error.errorCode ||
              updateData.postUpdate.error.code
            }
            message={updateData.postUpdate.error.message}
          />
        )}

        {loading ? (
          <Loader />
        ) : error ? (
          <Error message={error.message} />
        ) : data?.getPost?.error ? (
          <Error
            code={data.getPost.error.errorCode || data.getPost.error.code}
            message={data.getPost.error.message}
          />
        ) : (
          post && (
            <>
              <TextInput
                placeholder="Post Title"
                size="md"
                required
                disabled={updateLoading}
                {...form.getInputProps('title')}
              />

              <Divider mt="md" mb="md" />

              <Group position="apart" mb="lg">
                <Text color="dimmed" size="sm" italic>
                  By {post.author.name}
                </Text>
                <Text color="dimmed" size="sm" italic>
                  Last Updated At: {dateFormatter(post.updatedAt)}
                </Text>
              </Group>
              <Textarea
                placeholder="Post Content"
                required
                minRows={15}
                disabled={updateLoading}
                {...form.getInputProps('content')}
              />
              <Group position="right" mt="xl">
                <Button
                  size="md"
                  variant="outline"
                  color="gray.6"
                  onClick={() => router.back()}
                >
                  Discard Changes
                </Button>

                <Button
                  size="md"
                  color="cyan.4"
                  type="submit"
                  loading={updateLoading}
                  disabled={!form.isValid()}
                >
                  Save
                </Button>
              </Group>
            </>
          )
        )}
      </Container>
    </form>
  );
}
