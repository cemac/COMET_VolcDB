# Access settings for a given user
@app.route('/access/<string:id>', methods=['GET', 'POST'])
@is_logged_in_as_admin
def access(id):
    form = AccessForm(request.form)
    form.work_packages.choices = table_list('Work_Packages', 'code')[1:]
    form.partners.choices = table_list('Partners', 'name')[1:]
    # Retrieve user DB entry:
    user = Users.query.filter_by(id=id).first()
    if user is None:
        abort(404)
    # Retrieve all relevant entries in users2work_packages and users2partners:
    current_work_packages = psql_to_pandas(Users2Work_Packages.query.filter_by(
        username=user.username))['work_package'].tolist()
    current_partners = psql_to_pandas(Users2Partners.query.filter_by(
        username=user.username))['partner'].tolist()
    # If user submits edit entry form:
    if request.method == 'POST' and form.validate():
        new_work_packages = form.work_packages.data
        new_partners = form.partners.data
        # Delete relevant rows from users2work_packages:
        wps_to_delete = list(set(current_work_packages) -
                             set(new_work_packages))
        for wp in wps_to_delete:
            db_row = Users2Work_Packages.query.filter_by(
                username=user.username, work_package=wp).first()
            psql_delete(db_row, flashMsg=False)
        # Add relevant rows to users2work_packages:
        wps_to_add = list(set(new_work_packages) - set(current_work_packages))
        for wp in wps_to_add:
            db_row = Users2Work_Packages(
                username=user.username, work_package=wp)
            psql_insert(db_row, flashMsg=False)
        # Delete relevant rows from users2partners:
        partners_to_delete = list(set(current_partners) - set(new_partners))
        for partner in partners_to_delete:
            db_row = Users2Partners.query.filter_by(
                username=user.username, partner=partner).first()
            psql_delete(db_row, flashMsg=False)
        # Add relevant rows to users2work_packages:
        partners_to_add = list(set(new_partners) - set(current_partners))
        for partner in partners_to_add:
            db_row = Users2Partners(username=user.username, partner=partner)
            psql_insert(db_row, flashMsg=False)
        # Return with success
        flash('Edits successful', 'success')
        return redirect(url_for('access', id=id))
    # Pre-populate form fields with existing data:
    form.username.render_kw = {'readonly': 'readonly'}
    form.username.data = user.username
    form.work_packages.data = current_work_packages
    form.partners.data = current_partners
    return render_template('access.html.j2', form=form, id=id)


# Login
@app.route('/login', methods=["GET", "POST"])
def login():
    WP = 'none'
    Ps = 'none'
    if request.method == 'POST':
        # Get form fields
        username = request.form['username']
        password_candidate = request.form['password']
        # Check trainee accounts first:
        user = Users.query.filter_by(username=username).first()
        if user is not None:
            password = user.password
            # Compare passwords
            if sha256_crypt.verify(password_candidate, password):
                # Passed
                session['logged_in'] = True
                session['username'] = username
                session['admin'] = 'False'
                session['reader'] = 'False'
                user_wps = psql_to_pandas(Users2Work_Packages.query.filter_by(
                                          username=session['username'])
                                          )['work_package'].tolist()
                user_partners = psql_to_pandas(Users2Partners.query.filter_by(
                    username=session['username']))['partner'].tolist()
                if len(user_wps[:]) >= 1 and len(user_partners[:]) >= 1:
                    session['usertype'] = 'both'
                    flash(
                        'You are now logged in as both WP Leader and Partner Leader', 'success')
                elif len(user_wps[:]) >= 1:
                    session['usertype'] = 'WPleader'
                    flash('You are now logged in as WP Leader', 'success')
                elif len(user_partners[:]) >= 1:
                    session['usertype'] = 'Partnerleader'
                    flash('You are now logged in as Partner Leader', 'success')
                else:
                    flash('You are now logged in', 'success')
                if 'admin' in user_partners[:]:
                    session['admin'] = 'True'
                    flash('You have admin privileges', 'success')
                if 'ViewAll' in user_partners[:]:
                    session['reader'] = 'True'
                    flash('You have view all access', 'success')
                return redirect(url_for('index'))
            else:
                flash('Incorrect password', 'danger')
                return redirect(url_for('login'))
        # Finally check admin account:
        if username == 'admin':
            password = app.config['ADMIN_PWD']
            if password_candidate == password:
                # Passed
                session['logged_in'] = True
                session['username'] = 'admin'
                # session['usertype'] = 'admin'
                flash('You are now logged in as admin', 'success')
                return redirect(url_for('index'))
            else:
                flash('Incorrect password', 'danger')
                return redirect(url_for('login'))
        # Username not found:
        flash('Username not found', 'danger')
        return redirect(url_for('login'))
    if 'logged_in' in session:
        flash('Already logged in', 'warning')
        return redirect(url_for('index'))
    # Not yet logged in:
    return render_template('login.html.j2', WP=WP, P=Ps)


# Logout
@app.route('/logout')
@is_logged_in
def logout():
    session.clear()
    flash('You are now logged out', 'success')
    return redirect(url_for('index'))


# Change password
@app.route('/change-pwd', methods=["GET", "POST"])
@is_logged_in
def change_pwd():
    form = ChangePwdForm(request.form)
    if request.method == 'POST' and form.validate():
        user = Users.query.filter_by(username=session['username']).first()
        password = user.password
        current = form.current.data
        if sha256_crypt.verify(current, password):
            user.password = sha256_crypt.encrypt(str(form.new.data))
            db.session.commit()
            flash('Password changed', 'success')
            return redirect(url_for('change_pwd'))
        else:
            flash('Current password incorrect', 'danger')
            return redirect(url_for('change_pwd'))
    return render_template('change-pwd.html.j2', form=form)
