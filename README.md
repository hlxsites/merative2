# Merative.com (Phase 2)
merative.com on Adobe's AEM Franklin.

## Environments


| Type                                                                              | Description                                                                                                                                     |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`preview`](https://main--merative2--hlxsites.hlx.page/) | `.hlx.page` creates preview of content and  is automatically created for each branche for content preview and testing.                                               |
| [`live`](https://main--merative2--hlxsites.hlx.live/) | `.hlx.live` is the live/product ready enviroment for published content. |

## Getting started

See the links below for the steps needed to develop/contribute to this repo.

- [Setup](#setup)
- [Installing dependencies](#installing-dependencies)
- [Common tasks](#common-tasks)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Resources](#resources)

## Setup

Our repository requires that a forked repo is used for any work before
contributing back to the repository. This includes regular team members/maintainers.

1. Fork the project by navigating to the main
[repository](https://github.com/hlxsites/merative2) and
clicking the **Fork** button on the top-right corner.
2. Navigate to your forked repository and copy the **SSH url**. Clone your fork
by running the following in your terminal:
    
    ```
    $ git clone github.com:{ YOUR_USERNAME }/merative2.git
    $ cd merative2
    ```
    
    See [GitHub docs](https://help.github.com/articles/fork-a-repo/) for more
    details on forking a repository.
   
3. Once cloned, you will see `origin` as your default remote, pointing to your
personal forked repository. Add a remote named `upstream` pointing to the
main `merative2`:
    
    ```
    $ git remote add upstream git@github.com:hlxsites/merative2.git
    $ git remote -v
    ```
    
4. Switch to our version of Node. The currently supported node versions are
listed within the package.json file under the "engines" key.


## Installing dependencies

1. Install the [helix-bot](https://github.com/apps/helix-bot) app and make sure it has read/write access to your fork repository.

2. Install the [Helix CLI](https://github.com/adobe/helix-cli). This CLI allows engineers to create, develop, and deploy digital experiences using Project Helix.

```
npm install -g @adobe/helix-cli
```

3. In order for you to install all the dependencies in this project, you'll need to
[install NPM]([https://yarnpkg.com/en/docs/install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)) and run the following
command in your terminal:

```
npm install
```

Run your local Helix Pages Proxy. This opens http://localhost:3000/ and you are ready to make changes.

```
hlx up
```

You're all set and ready to start developing locally! 

A good place to start is in the blocks folder which is where most of the styling and code developed for this project. Simply make a change in a `.css` or `.js` and you should see the changes in your browser immediately.

## Common tasks

While working on the project, here are some of the top-level tasks that you might want to run:

| Command | Usage |
| --- | --- |
| `npm run test` | Use this command to run active tests |
| `npm run lint` | This command runs both `lint:css` and `lint:css` |


## Submitting a Pull Request

1. Pull the latest main branch from `upstream`:
    
    ```
    $ git pull upstream main
    ```
    
2. Always work and submit pull requests from a branch. *Do not submit pull
requests from the `main` branch of your fork*.
    
    ```
    $ git checkout -b { YOUR_BRANCH_NAME } main
    
    ```
    
3. Create your patch or feature.
4. Test your branch and add new test cases where appropriate.
5. Commit your changes using a descriptive commit message.
    
    ```
    $ git commit -m "fix(component-name): Update header with newest designs"
    ```
    
    **Note:** the optional commit -a command-line option will automatically "add"
    and "rm" edited files. See
    [Close a commit via commit message](https://help.github.com/articles/closing-issues-via-commit-messages/)
    and
    [writing good commit messages](https://github.com/erlang/otp/wiki/Writing-good-commit-messages)
    for more details on commit messages.
    
    This project uses a commit format called
    [Conventional Commits](https://www.conventionalcommits.org/). This format is
    used to help automate details about our project and how it changes. When
    committing changes, there will be a tool that automatically looks at commits
    and will check to see if the commit matches the format defined by
    Conventional Commits.
    
6. Once ready for feedback from other contributors and maintainers, **push your
commits to your fork** (be sure to run `npm run lint` and `npm run test` before pushing, to
make sure your code passes linting and unit tests):
    
    ```
    $ git push origin { YOUR_BRANCH_NAME }
    ```
    
7. In Github, navigate to
[https://github.com/hlxsites/merative2](https://github.com/hlxsites/merative2)
and click the button that reads "Compare & pull request".
8. Write a title and description, then click "Create pull request".
    
    Follow the PR template defined for the project.
    
9. Stay up to date with the activity in your pull request. Maintainers will be
reviewing your work and making comments, asking questions, and suggesting
changes to be made before they merge your code. 
10. When you need to make a
change, add, commit and push to your branch normally.
    
    Once all revisions to your pull request are complete, a maintainer will
    squash and merge your commits for you.
    
## Resources
    
- [Docs](https://www.hlx.live/docs/)
- [FAQs](https://www.hlx.live/docs/faq)
