struct stree
{
	string a;
	vector<vector<int> > t;
	vector<int> l, r, p, s;
	int tv, tp, ts, la, n;
	void extend(char c)
	{
		suff:;
		if (r[tv]<tp) {
			if (t[tv][c] == -1) {
				t[tv][c] = ts;  l[ts] = la;
				p[ts++] = tv;  tv = s[tv];  tp = r[tv] + 1;  goto suff;
			}
			tv = t[tv][c]; tp = l[tv];
		}
		if (tp == -1 || c == a[tp] - 'A') tp++; else {
			l[ts + 1] = la;  p[ts + 1] = ts;
			l[ts] = l[tv];  r[ts] = tp - 1;  p[ts] = p[tv];  t[ts][c] = ts + 1;  t[ts][a[tp] - 'A'] = tv;
			l[tv] = tp;  p[tv] = ts;  t[p[ts]][a[l[ts]] - 'A'] = ts;  ts += 2;
			tv = s[p[ts - 2]];  tp = l[ts - 2];
			while (tp <= r[ts - 2]) { tv = t[tv][a[tp] - 'A'];  tp += r[tv] - l[tv] + 1; }
			if (tp == r[ts - 2] + 1)  s[ts - 2] = tv;  else s[ts - 2] = ts;
			tp = r[tv] - (tp - r[ts - 2]) + 2;  goto suff;
		}
	}
	stree() {}
	stree(string &a) : a(a)
	{
		n = a.size();
		int N = 3 * n;
		ts = 2;
		tv = 0;
		tp = 0;
		t.assign(N, vector<int>(26, -1));
		t[1].assign(26, 0);
		p.assign(N, 0);
		s.assign(N, 0);
		l.assign(N, 0);
		r.assign(N, n - 1);
		s[0] = 1;
		l[0] = -1;
		r[0] = -1;
		l[1] = -1;
		r[1] = -1;
		// добавляем текст в дерево по одной букве
		for (la = 0; la<(int)a.size(); ++la)
			extend(a[la] - 'A');
	}
};