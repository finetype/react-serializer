
<a className={"test"} target="_blank" onClick={function() {"do something"}} href={"href"}>
    <div className="inner">
        <div className="ad-badge">Ad</div>;
        <div className="card-header">
            <div className="inner">
                <h5 className="carrier-title">
                    <div className="carrier-link">{true ? 'Metromile' : 'EverQuote'}</div>
                </h5>
            </div>
        </div>
        <div className="rate show">
            <span className="dolla-dolla-bill">$</span><span className="rate-value">{true ? 39 : 29}</span>
            <span className="rate-tag">{true ? '+ 5¢ per mile' : 'and up'}</span>
        </div>
    </div>
</a>
