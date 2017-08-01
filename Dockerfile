
# from https://github.com/jupyter/docker-stacks/wiki/Docker-Recipes#using-pip-install-in-a-child-docker-image
FROM jupyter/datascience-notebook

# install in the default python3 environment
RUN pip install geocoder lxml html5lib tqdm
# install in the python2 environment also
# RUN bash -c "source activate python2 && pip install 'ggplot==0.6.8'"

# USER $NB_USER

# from jupyter stack
# Install Python 3 packages
# Remove pyqt and qt pulled in for matplotlib since we're only ever going to
# use notebook-friendly backends in these images
# RUN conda install --quiet --yes \
#     'nomkl' \
#     'ipywidgets=6.0*' \
#     'pandas=0.19*' \
#     'numexpr=2.6*' && \
#     conda remove --quiet --yes --force qt pyqt && \
#     conda clean -tipsy
#
#     # Install Python 2 packages
# # Remove pyqt and qt pulled in for matplotlib since we're only ever going to
# # use notebook-friendly backends in these images
# RUN conda create --quiet --yes -p $CONDA_DIR/envs/python2 python=2.7 \
#     'nomkl' \
#     'ipython=5.3*' \
#     'ipywidgets=6.0*' \
#     'pandas=0.19*' \
